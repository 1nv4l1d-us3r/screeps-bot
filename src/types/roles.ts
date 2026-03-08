import { Coord } from "./geometry";
import { MiningSiteConfig } from "./room/planner";

export enum WorkerRoles{
    HARVESTER = "harvester",
    BUILDER = "builder",
    UPGRADER = "upgrader",
    MINER = "miner",
    HAULER = "hauler",
}

// -------------- Harvester Memory --------------//
export type RefillingStructure = StructureExtension|StructureTower|StructureSpawn;


interface BaseRoleMemory {
    role: WorkerRoles;
}

export interface HarvesterMemory extends BaseRoleMemory {
    role: WorkerRoles.HARVESTER;
    energyFillingStructureId?: Id<RefillingStructure>;
}


export interface BuilderMemory extends BaseRoleMemory {
    role: WorkerRoles.BUILDER;
    targetConstructionSiteId?: Id<ConstructionSite>;
}

export interface MinerMemory extends BaseRoleMemory {
    role: WorkerRoles.MINER;
    resourceId: MiningSiteConfig['resourceId'];
    resourceType: MiningSiteConfig['resourceType'];
    miningCoord:MiningSiteConfig['miningCoord']
    storageType?: MiningSiteConfig['storageType'];
    storageCoord?: MiningSiteConfig['storageCoord'];

    storageStructureId?: Id<StructureContainer | StructureLink>;
}

export interface MineHaulerMemory extends BaseRoleMemory {
    role: WorkerRoles.HAULER;
    miningCoord: Coord;
    storageCoord?: Coord;

    withdrawStructureId?: Id<StructureContainer>;
    droppedResourceId?: Id<Resource>;
}



export type RoleMemory<R extends WorkerRoles> = (
    HarvesterMemory
    | BuilderMemory
    | MinerMemory
    | MineHaulerMemory
) & {
    role: R;
}