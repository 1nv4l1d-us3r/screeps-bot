import { Coord } from "../geometry";
import { Worker, WorkerMemory } from "../worker";



// -------------- Base Configuration --------------//
export interface BaseConfig{
    primarySpawnCoord: Coord;
    storageCoord: Coord;
    baseLinkCoord: Coord;
    tempStorage1Coord: Coord;
    tempStorage2Coord: Coord;
}   



// -------------- Mining Configuration --------------//
export interface MiningSiteConfig{
    resourceId: Id<Source | Mineral>;
    resourceType: RESOURCE_ENERGY | MineralConstant;
    miningCoord: Coord;
    storageType?: STRUCTURE_CONTAINER | STRUCTURE_LINK;
    storageCoord?: Coord;
}


interface MinerMemory{
    resourceId: Id<Source | Mineral>;
    resourceType: RESOURCE_ENERGY | MineralConstant;
    miningCoord: Coord;
    storageType?: STRUCTURE_CONTAINER | STRUCTURE_LINK;
    storageCoord?: Coord;
    storageStructureId?: Id<StructureContainer | StructureLink>;
}




// -------------- Link Configuration --------------//
// TODO: implement this later
interface LinkConfig{
    linkCoord: Coord;
    type:any
}
// -------------- Population Configuration --------------//

export interface WorkerSpawnConfig{
    workerId: Id<Worker>;
    bodyParts: BodyPartConstant[];
    optimalBodyParts: BodyPartConstant[];
    memory: WorkerMemory;
}

export interface PopulationConfig{
    totalWorkers: number;
    workerSpawnConfigs: WorkerSpawnConfig[];
}



// -------------- Room Plan --------------//

export interface RoomPlan{
    baseConfig: BaseConfig;
    miningConfig: MiningSiteConfig[];
    populationConfig: PopulationConfig;
}