//Calculos del modelo M/M/S.
import type { QueueInput, QueueResult } from "../../models/queue.types";
import { factorial } from "../../utils/math";

export function calculateMMS (data:QueueInput): QueueResult {
    const { lambda, mu } = data;
    const s = data.s ?? 1;

    const lambdaOverMu = lambda / mu;
    const rho = lambda / (s * mu);

    //Variable acumuladora
  let sum = 0; 

  // Σ desde n = 0 hasta s - 1 de (λ/μ)^n / n!
  for (let n = 0; n <= s - 1; n++) {
    sum += Math.pow(lambdaOverMu, n) / factorial(n);
  }

  // ((λ/μ)^s / s!) * (sμ / (sμ - λ))
  const secondPart =
    (Math.pow(lambdaOverMu, s) / factorial(s)) *
    ((s * mu) / ((s * mu) - lambda));

  // P0 = 1 / [sumatoria + secondPart]
  const p0 = 1 / (sum + secondPart);

  const Lq = (p0 * Math.pow(lambdaOverMu, s) * rho) / (factorial(s) * Math.pow(1 - rho, 2));
  const LqRounded = Math.ceil(Lq);

  const L = LqRounded + lambdaOverMu;
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
    servers: s,
  };

}
