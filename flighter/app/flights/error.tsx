"use client";

export default function FlightsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl p-6 text-center">
      <h2 className="text-xl font-semibold">Unable to load flights</h2>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex items-center rounded-md border px-4 py-2 text-sm"
      >
        Retry
      </button>
    </div>
  );
}
