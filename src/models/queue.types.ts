//Crear los tipos de las variables

export type QueueModel = "MM1" | "MMS" | "MG1" | "MD1" ;

export interface QueueInput {
    model: QueueModel;
    lambda: number;
    mu: number;
    s?: number;
    sigma2?: number;
}

export interface QueueResult {
    rho: number;
    p0: number;
    Lq: number;
    L: number;
    LqRounded: number;
    LRounded: number;
    Wq: number;
    W: number;
    stable: boolean;

}