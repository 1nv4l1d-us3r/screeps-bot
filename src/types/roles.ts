import { Coord } from "./geometry";
import { MiningSiteConfig } from "./room/planner";

export enum WorkerRoles{
    FILLER = "filler",
    BUILDER = "builder",
    UPGRADER = "upgrader",
    REPAIRER = "repairer",
    MINER = "miner",
    HAULER = "hauler",
}


interface BaseRoleMemory {
    role: WorkerRoles;
}

export interface FillterMemory extends BaseRoleMemory {
    role: WorkerRoles.FILLER;
}

export interface RepairerMemory extends BaseRoleMemory {
    role: WorkerRoles.REPAIRER;
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
    resourceType: MiningSiteConfig['resourceType'];
    miningCoord: MiningSiteConfig['miningCoord'];
    storageCoord?: MiningSiteConfig['storageCoord'];

    withdrawStructureId?: Id<StructureContainer>;
    droppedResourceId?: Id<Resource>;
}



export type RoleMemory<R extends WorkerRoles> = (
     FillterMemory
    | RepairerMemory
    | BuilderMemory
    | MinerMemory
    | MineHaulerMemory
) & {
    role: R;
}