import { HeatMap } from "./common";
import { Worker, WorkerMemory } from "./worker";

export interface WorkerSpawnConfig {
    workerId:Id<Worker>;
    bodyParts: BodyPartConstant[];
    memory: WorkerMemory;
}

export interface RoomPopulation{
    totalWorkers: number;
    workerSpawnConfigs: WorkerSpawnConfig[];
}

export interface CustomRoomMemory {
    hasHostileCreeps?:boolean;
    
    roomPopulation?: RoomPopulation;
    
    fatigueHeatMap?: HeatMap;
    isMonitoringFatigue?:boolean;
}
