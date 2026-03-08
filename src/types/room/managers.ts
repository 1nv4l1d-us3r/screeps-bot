import { Coord } from "../geometry";
import { WorkerSpawnConfig } from "./planner";



export interface SpawningOperation{
    spawnQueue:WorkerSpawnConfig[];
    lockedUntil?:number;
}

export interface LogisticsOperation{
    storageProviderIds:Id<StructureStorage | StructureContainer | StructureSpawn>[];
}


export interface ConstructionRequest{
    coord:Coord,
    structureType:BuildableStructureConstant,
    replaceExisting?:boolean,
}


export interface RoomOperations{
    constructionRequests:ConstructionRequest[],
}
