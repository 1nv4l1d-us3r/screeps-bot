import { Coord } from "../geometry";
import { WorkerSpawnConfig } from "./planner";



export interface SpawningOperation{
    spawnQueue:WorkerSpawnConfig[];
    lockedUntil?:number;
}

export interface LogisticsOperation{
    storageProviderIds:Id<StructureStorage | StructureContainer | StructureSpawn>[];
    upgraderStorageId?:Id<StructureContainer | StructureLink>;
    upgraderStorageType?:STRUCTURE_CONTAINER | STRUCTURE_LINK;
}

export interface ConstructionRequest{
    coord:Coord,
    structureType:BuildableStructureConstant,
    replaceExisting?:boolean,
}

export interface ConstructionOperation{
    constructionQueue:ConstructionRequest[];
    constructionSiteIds?:Id<ConstructionSite>[];
}



