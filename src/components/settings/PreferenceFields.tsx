import SettingRow from "@/components/settings/SettingRow";
import type { UserPreferences } from "@/features/preferences/contracts";

const selectClassName =
  "border-border bg-paper rounded-control min-h-11 border px-3 text-sm font-semibold";
const rates = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const intervals = [5, 10, 15, 30, 45, 60] as const;

interface PreferenceFieldsProps {
  onChange: (preferences: UserPreferences) => void;
  preferences: UserPreferences;
}

export default function PreferenceFields({
  onChange,
  preferences,
}: PreferenceFieldsProps) {
  const update = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => onChange({ ...preferences, [key]: value });

  function updateTheme(theme: UserPreferences["theme"]) {
    document
      .querySelector<HTMLElement>("[data-theme]")
      ?.setAttribute("data-theme", theme);
    update("theme", theme);
  }

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold">Playback</h2>
        <div className="divide-border border-border bg-paper-elevated rounded-card divide-y border px-5">
          <SettingRow
            action={
              <select
                aria-label="Default playback speed"
                className={selectClassName}
                onChange={(event) =>
                  update("defaultPlaybackRate", Number(event.target.value))
                }
                value={preferences.defaultPlaybackRate}
              >
                {rates.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}×
                  </option>
                ))}
              </select>
            }
            description="Applied when a book does not have its own saved speed."
            title="Default playback speed"
          />
          <SettingRow
            action={
              <div className="flex gap-2">
                <select
                  aria-label="Skip backward seconds"
                  className={selectClassName}
                  onChange={(event) =>
                    update("skipBackSeconds", Number(event.target.value))
                  }
                  value={preferences.skipBackSeconds}
                >
                  {intervals.map((seconds) => (
                    <option key={seconds} value={seconds}>
                      −{seconds}s
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Skip forward seconds"
                  className={selectClassName}
                  onChange={(event) =>
                    update("skipForwardSeconds", Number(event.target.value))
                  }
                  value={preferences.skipForwardSeconds}
                >
                  {intervals.map((seconds) => (
                    <option key={seconds} value={seconds}>
                      +{seconds}s
                    </option>
                  ))}
                </select>
              </div>
            }
            description="Used by player buttons and Media Session controls."
            title="Skip intervals"
          />
          <SettingRow
            action={
              <select
                aria-label="Default sleep timer"
                className={selectClassName}
                onChange={(event) =>
                  update(
                    "defaultSleepTimerMinutes",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                value={preferences.defaultSleepTimerMinutes ?? ""}
              >
                <option value="">Off</option>
                {[15, 30, 60].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </select>
            }
            description="The timer selected when a new book starts."
            title="Default sleep timer"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold">Appearance</h2>
        <div className="divide-border border-border bg-paper-elevated rounded-card divide-y border px-5">
          <SettingRow
            action={
              <select
                aria-label="Color theme"
                className={selectClassName}
                onChange={(event) =>
                  updateTheme(event.target.value as UserPreferences["theme"])
                }
                value={preferences.theme}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            }
            description="Follow this device or keep a consistent account theme."
            title="Color theme"
          />
          <SettingRow
            action={<span className="text-success text-xs font-bold">On</span>}
            description="Newest accepted listening positions remain available on your devices."
            title="Sync listening progress"
          />
        </div>
      </section>
    </>
  );
}
