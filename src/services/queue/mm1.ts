//Calculos del modelo M/M/1.
import type { QueueInput, QueueResult } from "../../models/queue.types";

export function calculateMM1(data: QueueInput): QueueResult {
    const {lambda, mu} = data;

    const rho = lambda / mu;
    const p0 = 1 - rho;
    const Lq = (Math.pow(lambda,2)) / (mu * (mu - lambda));
    const LqRounded = Math.ceil(Lq);
    const L = LqRounded + ( lambda / mu );
    const LRounded = Math.ceil(L);
    const Wq = Lq / lambda;
    const W = Wq + ( 1 / mu);

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
