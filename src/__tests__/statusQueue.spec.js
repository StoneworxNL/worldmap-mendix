import { createStatusQueue } from "../components/statusQueue";

const drain = queue => {
    const runs = [];
    for (let next = queue.shift(); next; next = queue.shift()) {
        runs.push(`${next.regionStatus} ${next.regionCountryCode}`.trim());
    }
    return runs;
};

describe("createStatusQueue", () => {
    it("keeps only each country's latest status, in the order the countries first reported", () => {
        const queue = createStatusQueue();
        queue.push("loading", "PT");
        queue.push("loading", "ES");
        queue.push("ready", "PT");
        queue.push("unavailable", "ES");

        expect(queue.size).toBe(2);
        expect(drain(queue)).toEqual(["ready PT", "unavailable ES"]);
        expect(queue.size).toBe(0);
        expect(queue.shift()).toBeUndefined();
    });

    it("queues at most one call per country, however many statuses arrive", () => {
        const queue = createStatusQueue();
        const countries = Array.from({ length: 40 }, (_, i) => `C${i}`);
        for (const status of ["loading", "ready", "loading", "failed"]) {
            countries.forEach(code => queue.push(status, code));
        }

        expect(queue.size).toBe(40);
        expect(drain(queue).every(run => run.startsWith("failed "))).toBe(true);
    });

    it("drops everything still pending on idle", () => {
        const queue = createStatusQueue();
        queue.push("loading", "PT");
        queue.push("loading", "ES");
        queue.push("idle", undefined);

        expect(drain(queue)).toEqual(["idle"]);

        queue.push("idle");
        queue.push("loading", "NL");
        expect(drain(queue)).toEqual(["idle", "loading NL"]);
    });

    it("can be cleared", () => {
        const queue = createStatusQueue();
        queue.push("loading", "PT");
        queue.clear();

        expect(queue.size).toBe(0);
    });
});
