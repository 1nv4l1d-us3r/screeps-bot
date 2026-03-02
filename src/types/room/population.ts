import { Worker, WorkerMemory } from "../worker";

export interface WorkerSpawnConfig {
    workerId:Id<Worker>;
    bodyParts: BodyPartConstant[];
    optimalBodyParts: BodyPartConstant[];
    memory: WorkerMemory;
}

export interface RoomPopulation{
    totalWorkers: number;
    workerSpawnConfigs: WorkerSpawnConfig[];
}
