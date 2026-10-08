import { HeartAssessmentData, PredictionResponse, HealthStatus } from "./types";

/**
 * Resolves the service endpoint URL based on environment and runtime context.
 *
 * 1. Server-side Function Runtime (Next.js server / Vercel Functions):
 *    Uses the `BACKEND_URL` environment variable injected by the Vercel service binding:
 *    `new URL(endpointPath, process.env.BACKEND_URL)`
 *
 * 2. Explicit Public URL:
 *    Uses `NEXT_PUBLIC_API_URL` if configured.
 *
 * 3. Browser Runtime (Same-domain deployment on Vercel):
 *    Uses the relative path (e.g. `/api/...`) which Vercel rewrites to the backend service.
 *
 * 4. Local Development Fallback:
 *    Falls back to `http://localhost:8000`.
 */
export function getBackendUrl(endpointPath: string): string {
  const cleanPath = endpointPath.startsWith("/") ? endpointPath.slice(1) : endpointPath;

  // Server-side execution in Vercel Functions / Next.js Server Components
  if (typeof window === "undefined" && process.env.BACKEND_URL) {
    const base = process.env.BACKEND_URL.endsWith("/")
      ? process.env.BACKEND_URL
      : `${process.env.BACKEND_URL}/`;
    return new URL(cleanPath, base).toString();
  }

  // Explicit public API URL (if configured)
  if (process.env.NEXT_PUBLIC_API_URL) {
    const base = process.env.NEXT_PUBLIC_API_URL.endsWith("/")
      ? process.env.NEXT_PUBLIC_API_URL
      : `${process.env.NEXT_PUBLIC_API_URL}/`;
    return new URL(cleanPath, base).toString();
  }

  // Client-side in browser (uses Vercel's unified domain routing)
  if (typeof window !== "undefined") {
    return `/${cleanPath}`;
  }

  // Fallback for standalone local development
  return `http://localhost:8000/${cleanPath}`;
}

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const url = getBackendUrl("api/health");
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new ApiError(`Health check failed with status ${res.status}`, res.status);
    }

    return await res.json();
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to connect to the HeartGuard prediction service.", 0);
  }
}

export async function predictRisk(data: HeartAssessmentData): Promise<PredictionResponse> {
  try {
    const url = getBackendUrl("api/predict");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = (await res.json()) as Record<string, unknown>;
      } catch {
        // Response wasn't JSON
      }

      const message = typeof errorData.message === "string"
        ? errorData.message
        : `Prediction service returned status ${res.status}`;
      const details = Array.isArray(errorData.details)
        ? (errorData.details as string[])
        : undefined;
      throw new ApiError(message, res.status, details);
    }

    return await res.json();
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Unable to complete the assessment. Please check that the prediction service is running and try again.",
      0
    );
  }
}
