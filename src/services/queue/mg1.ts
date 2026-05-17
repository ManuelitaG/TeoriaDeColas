//Calculos del modelo M/D/1.
import type { QueueInput, QueueResult } from "../../models/queue.types";

export function calculateMD1 (data:QueueInput): QueueResult {
    const { lambda, mu } = data;
    const sigma2 = data.sigma2 ?? 0;

    const rho = lambda / mu;
    const p0 = 1 - rho;

    const Lq = (((lambda * lambda) * (sigma2 * sigma2)) + (rho * rho)) / (2 * p0);
    const LqRounded = Math.ceil(Lq);

    const L = LqRounded + (lambda/mu)
    const LRounded = Math.ceil(L);

    const Wq = LqRounded / lambda;
    const W = Wq + (1/mu);

    return {
        rho,
        p0,
        Lq,
        LqRounded,
        L,
        LRounded,
        Wq,
        W,
        stable: rho < 1,
    };
}