import "server-only";

import { NextResponse } from "next/server";

const TITLES: Readonly<Record<number, string>> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
};

interface ProblemOptions {
  extensions?: Readonly<Record<string, unknown>>;
  headers?: HeadersInit;
  title?: string;
  type?: string;
}

export function problemResponse(
  detail: string,
  status: number,
  options: ProblemOptions = {},
): NextResponse {
  return NextResponse.json(
    {
      type: options.type ?? "about:blank",
      title: options.title ?? TITLES[status] ?? "Request Failed",
      status,
      detail,
      ...options.extensions,
    },
    {
      headers: {
        "cache-control": "no-store",
        "content-type": "application/problem+json",
        ...options.headers,
      },
      status,
    },
  );
}
