import { MiningSiteConfig } from "./room/planner";

export enum WorkerRoles{
    HARVESTER = "harvester",
    BUILDER = "builder",
    UPGRADER = "upgrader",
    MINER = "miner",
}

// -------------- Harvester Memory --------------//
export type RefillingStructure = StructureExtension|StructureTower|StructureSpawn;

export interface HarvesterMemory {
    energyFillingStructureId?: Id<RefillingStructure>;
}


export interface BuilderMemory{
    targetConstructionSiteId?: Id<ConstructionSite>;
}

export interface MinerMemory{
    resourceId: MiningSiteConfig['resourceId'];
    resourceType: MiningSiteConfig['resourceType'];
    miningCoord:MiningSiteConfig['miningCoord']
    storageType?: MiningSiteConfig['storageType'];
    storageCoord?: MiningSiteConfig['storageCoord'];

    storageStructureId?: Id<StructureContainer | StructureLink>;
}


export interface RoleMemory extends 
    HarvesterMemory,
    BuilderMemory,
    MinerMemory
{
}