//Calculos del modelo M/D/1.
import type { QueueInput, QueueResult } from "../../models/queue.types";

export function calculateMD1 (data:QueueInput): QueueResult {
    const { lambda, mu, s = 1} = data;

    const rho = lambda / (s * mu);
    const p0 = 1 - rho;

    const Lq = (Math.pow(rho,2)) / (2 * p0);
    const LqRounded = Math.ceil(Lq);

    const L = LqRounded + (lambda/mu);
    const LRounded = Math.ceil(L);

    const Wq = LqRounded / lambda;
    const W = Wq + (1/mu);

    return{
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