import { RoleMemory } from "types/roles";
import { Coord, PackedCoord } from "../geometry";
import { Worker } from "../worker";
import { WorkerRoles } from "types/roles";



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
    extractorCoord?: Coord;
}



// -------------- Logistics Configuration --------------//
export interface LogisticsConfig {
    upgraderStoragePackedCoord: PackedCoord;
    upgraderStorageType?: STRUCTURE_CONTAINER | STRUCTURE_LINK;
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
    roleMemory: RoleMemory<WorkerRoles>
}

export interface PopulationConfig{
    totalWorkers: number;
    workerSpawnConfigs: WorkerSpawnConfig[];
}



// -------------- Room Plan --------------//

export interface RoomPlan{
    baseConfig: BaseConfig;
    miningConfig: MiningSiteConfig[];
    logisticsConfig: LogisticsConfig;
    populationConfig: PopulationConfig;
}