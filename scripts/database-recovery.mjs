import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIRECTORY, "..");
const SUPABASE_DIRECTORY = join(PROJECT_ROOT, "supabase");
const MIGRATIONS_DIRECTORY = join(SUPABASE_DIRECTORY, "migrations");
const ROLLBACKS_DIRECTORY = join(SUPABASE_DIRECTORY, "rollbacks");
const CONFIG_PATH = join(SUPABASE_DIRECTORY, "config.toml");
const SQL_FILE_PATTERN = /\.sql$/u;
const MIGRATION_SUFFIX = ".sql";
const ROLLBACK_SUFFIX = "_down.sql";
const APPLICATION_RELATIONS = [
  "audiobook_files",
  "audiobooks",
  "bookmarks",
  "chapters",
  "drive_connections",
  "playback_progress",
  "profiles",
  "user_preferences",
];

function fail(message) {
  throw new Error(message);
}

function runCommand({ command, args, input, label }) {
  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    input,
    stdio: input === undefined ? "inherit" : ["pipe", "pipe", "pipe"],
  });

  if (result.error) {
    fail(`${label} could not start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();
    fail(`${label} failed${details ? `:\n${details}` : "."}`);
  }

  return result.stdout?.trim() ?? "";
}

function readSqlFiles(directory) {
  return readdirSync(directory)
    .filter((fileName) => SQL_FILE_PATTERN.test(fileName))
    .sort();
}

function assertRollbackCoverage(migrationFiles, rollbackFiles) {
  const expectedRollbacks = migrationFiles.map((fileName) =>
    fileName.replace(MIGRATION_SUFFIX, ROLLBACK_SUFFIX),
  );

  if (JSON.stringify(expectedRollbacks) !== JSON.stringify(rollbackFiles)) {
    fail("Every migration must have exactly one matching rollback file.");
  }
}

function resolveContainerName() {
  const config = readFileSync(CONFIG_PATH, "utf8");
  const projectId = config.match(/^project_id\s*=\s*"([^"]+)"/mu)?.[1];

  if (!projectId) {
    fail("supabase/config.toml must define project_id.");
  }

  return `supabase_db_${projectId}`;
}

function runDatabaseSql({ containerName, sql, label }) {
  return runCommand({
    command: "docker",
    args: [
      "exec",
      "-i",
      containerName,
      "psql",
      "--username",
      "postgres",
      "--dbname",
      "postgres",
      "--no-psqlrc",
      "--set",
      "ON_ERROR_STOP=1",
      "--tuples-only",
      "--no-align",
    ],
    input: sql,
    label,
  });
}

function runSupabase(args, label) {
  const isWindows = process.platform === "win32";
  const executable = isWindows
    ? "npx.cmd"
    : join(PROJECT_ROOT, "node_modules", ".bin", "supabase");
  const commandArgs = isWindows ? ["supabase", ...args] : args;

  if (!isWindows && !existsSync(executable)) {
    fail("Install project dependencies before running database recovery.");
  }

  runCommand({ command: executable, args: commandArgs, label });
}

function applyRollbacks(containerName, rollbackFiles) {
  for (const fileName of [...rollbackFiles].reverse()) {
    const sql = readFileSync(join(ROLLBACKS_DIRECTORY, fileName), "utf8");
    runDatabaseSql({
      containerName,
      sql,
      label: `Rollback ${fileName}`,
    });
  }
}

function assertApplicationSchemaRemoved(containerName) {
  const relationList = APPLICATION_RELATIONS.map((name) => `'${name}'`).join(
    ", ",
  );
  const relationCount = runDatabaseSql({
    containerName,
    sql: `select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname in (${relationList});`,
    label: "Verify rollback result",
  });

  if (relationCount !== "0") {
    fail(
      `Rollback left ${relationCount} application relations in the public schema.`,
    );
  }
}

function main() {
  const migrationFiles = readSqlFiles(MIGRATIONS_DIRECTORY);
  const rollbackFiles = readSqlFiles(ROLLBACKS_DIRECTORY);
  const containerName = resolveContainerName();

  assertRollbackCoverage(migrationFiles, rollbackFiles);
  applyRollbacks(containerName, rollbackFiles);
  assertApplicationSchemaRemoved(containerName);
  runSupabase(
    ["db", "reset", "--local", "--no-seed", "--yes"],
    "Migration recovery",
  );
  runSupabase(["test", "db"], "Recovered database tests");
}

try {
  main();
  process.stdout.write("Database rollback and migration recovery passed.\n");
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown database recovery failure.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
