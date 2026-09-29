import { AsyncLocalStorage } from 'async_hooks';

// Request-scoped array. Handlers push here when they catch and swallow an error, so we can
// fail loud at the end of the pipeline instead of returning a 200 with silently-partial data.
// AsyncLocalStorage keeps the array per-request under Node's async concurrency (Cloud Run
// default concurrency is 80 per instance, so a module-level singleton would race).
export const errorContext = new AsyncLocalStorage<string[]>();

export function reportError(handler: string, error: unknown) {
    const store = errorContext.getStore();
    if (!store) return;
    const message = error instanceof Error ? error.message : String(error);
    store.push(`${handler}: ${message}`);
}
