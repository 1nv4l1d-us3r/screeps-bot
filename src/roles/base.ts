

export enum WorkerRoles{
    HARVESTER = "harvester",
    UPGRADER = "upgrader",
    BUILDER = "builder",
}

export const WorkerSpawnOrder:Record<WorkerRoles, number> = {
    [WorkerRoles.HARVESTER]: 0,
    [WorkerRoles.BUILDER]: 2,
    [WorkerRoles.UPGRADER]: 1,
}