import { WorkerRoles } from "./base";
import { harvesterRole,Harvester } from "./harvester";
import { upgraderRole,Upgrader } from "./upgrader";
import { builderRole,Builder } from "./builder";
import { minerRole,Miner } from "./miner";



export type Worker=
    | Harvester
    | Builder
    | Upgrader
    | Miner

export const getWorkerHandler = (creep: Worker) => {
    switch(creep.memory.role) {
        case WorkerRoles.HARVESTER:
            return harvesterRole
        case WorkerRoles.UPGRADER:
            return upgraderRole;
        case WorkerRoles.BUILDER:
            return builderRole;
        case WorkerRoles.MINER:
            return minerRole;
    }
}