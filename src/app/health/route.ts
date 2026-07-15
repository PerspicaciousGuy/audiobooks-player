const HEALTH_RESPONSE = {
  status: "ok",
} as const;

export function GET(): Response {
  return Response.json(HEALTH_RESPONSE, {
    headers: {
      "Cache-Control": "no-store",
    },
    status: 200,
  });
}
