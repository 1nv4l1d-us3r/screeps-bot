

export enum WorkerRoles{
    HARVESTER = "harvester",
    UPGRADER = "upgrader",
    BUILDER = "builder",
    MINER = "miner",
}

export const WorkerSpawnOrder:Record<WorkerRoles, number> = {
    [WorkerRoles.MINER]: 0,
    [WorkerRoles.HARVESTER]: 1,
    [WorkerRoles.UPGRADER]: 2,
    [WorkerRoles.BUILDER]: 3,
}