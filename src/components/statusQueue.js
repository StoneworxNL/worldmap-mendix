/**
 * The region statuses still to pass to On region status change. Only each country's latest status is kept, so zooming
 * over many countries queues at most one call per country, and "idle" (regions hidden again) drops everything still
 * pending: those statuses are out of date once the user has zoomed out.
 */
export function createStatusQueue() {
    // A Map keeps insertion order: countries run in the order they first reported, each with its latest status.
    const pending = new Map();
    return {
        push(status, countryCode) {
            const code = countryCode ?? "";
            if (status === "idle") {
                pending.clear();
            }
            pending.set(code, { regionStatus: status, regionCountryCode: code });
        },
        /** Removes and returns the oldest pending status, or undefined. */
        shift() {
            const next = pending.entries().next();
            if (next.done) {
                return undefined;
            }
            pending.delete(next.value[0]);
            return next.value[1];
        },
        clear() {
            pending.clear();
        },
        get size() {
            return pending.size;
        }
    };
}
