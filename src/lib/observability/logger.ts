type EventLevel = "error" | "info" | "warn";

export type ServerEventName =
  | "account_delete_failed"
  | "account_deleted"
  | "rate_limit_denied"
  | "rate_limit_unavailable";

export interface ServerEventFields {
  operation?: string;
  outcome?: "denied" | "failure" | "success" | "unavailable";
  status?: number;
}

export function recordServerEvent(
  level: EventLevel,
  event: ServerEventName,
  fields: ServerEventFields = {},
): void {
  const entry = {
    event,
    ...(fields.operation ? { operation: fields.operation } : {}),
    ...(fields.outcome ? { outcome: fields.outcome } : {}),
    ...(fields.status ? { status: fields.status } : {}),
    timestamp: new Date().toISOString(),
  };

  console[level](JSON.stringify(entry));
}
