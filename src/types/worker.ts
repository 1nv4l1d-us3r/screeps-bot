import { EnergyCollectionMemory } from "./actions";
import { ResourceMiningMemory } from "./actions";




export enum WorkerRoles{
    HARVESTER = "harvester",
    BUILDER = "builder",
    UPGRADER = "upgrader",
    MINER = "miner",
}


// -------------- Harvester Memory --------------//
export type RefillingStructure = StructureExtension|StructureTower|StructureSpawn;

export interface HarvesterMemory extends EnergyCollectionMemory{
    energyFillingStructureId?: Id<RefillingStructure>;
}


// -------------- Builder Memory --------------//
export interface BuilderMemory extends EnergyCollectionMemory{
    targetConstructionSiteId?: Id<ConstructionSite>;
}


// -------------- Upgrader Memory --------------//
export type UpgraderMemory = EnergyCollectionMemory;



// -------------- Miner Memory --------------//
export interface MinerMemory extends  ResourceMiningMemory {
    storageStructureType?: STRUCTURE_CONTAINER | STRUCTURE_LINK;
    storageStructureId?: Id<StructureContainer | StructureLink>;
}



// -------------- Worker Memory --------------//
export interface WorkerMemory 
    extends 
        BuilderMemory,
        HarvesterMemory,
        MinerMemory,
        UpgraderMemory 
    {
        role: WorkerRoles;
    }


// -------------- Base Worker --------------//
export type BaseWorkerMemory = {}

export type BaseWorker<M extends BaseWorkerMemory> = Creep & {
    memory: M;
}

export type Worker = BaseWorker<WorkerMemory>;



// -------------- Worker Config --------------//

export interface WorkerConfig<M extends CreepMemory>{
    role: WorkerRoles;
    spawnPriority: number;
    roleHandler: (worker: BaseWorker<M>) => void;
}


export type WorkersConfig = Record<WorkerRoles, WorkerConfig<WorkerMemory>>;
