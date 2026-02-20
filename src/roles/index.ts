
import { harvesterRole } from "./harvester";
import { upgraderRole, } from "./upgrader";
import { builderRole} from "./builder";
import { minerRole } from "./miner";

import { WorkerRoles, WorkersConfig, Worker } from "../types/worker";





const workersConfig:WorkersConfig = {
    [WorkerRoles.MINER]: {
        role: WorkerRoles.MINER,
        spawnPriority: 0,
        roleHandler: minerRole,
    },
    [WorkerRoles.HARVESTER]: {
        role: WorkerRoles.HARVESTER,
        spawnPriority: 1,
        roleHandler: harvesterRole,
    },
    [WorkerRoles.UPGRADER]: {
        role: WorkerRoles.UPGRADER,
        spawnPriority: 2,
        roleHandler: upgraderRole,
    },
    [WorkerRoles.BUILDER]: {
        role: WorkerRoles.BUILDER,
        spawnPriority: 3,
        roleHandler: builderRole,
    },
}

export const getWorkerHandler = (worker:Worker) => {
    const role = worker.memory.role;
    return workersConfig[role].roleHandler;
}


export const getWorkerSpawnPriority = (role: WorkerRoles) => {
    return workersConfig[role]?.spawnPriority || Infinity;
}