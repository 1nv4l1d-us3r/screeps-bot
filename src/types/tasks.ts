import { WorkerRoles } from "./roles";
import { Worker, WorkerMemory } from "./worker";

export enum TasksType{
    WITHDRAW_ENERGY = "WITHDRAW_ENERGY",
    PICKUP_RESOURCE = "PICKUP_RESOURCE",
    TRANSFER_RESOURCE = "TRANSFER_RESOURCE",
    MINE_RESOURCE = "MINE_RESOURCE",
    // BUILD_STRUCTURE = "BUILD_STRUCTURE",
}

// -------------- Energy Collection --------------//
export interface WithdrawEnergyTask{
    taskType: TasksType.WITHDRAW_ENERGY;
    data: {
        withdrawStructureId?: Id<StructureContainer|StructureStorage |StructureSpawn>;
    }
}


// -------------- Resource Mining --------------//
export interface ResourceMiningTask{
    taskType: TasksType.MINE_RESOURCE;
    data: {
        resourceId: Id<Source|Mineral>;   
    }
}

// -------------- Resource Pickup --------------//
export interface PickupResourceTask{
    taskType: TasksType.PICKUP_RESOURCE;
    data: {
        droppedResourceId: Id<Resource>;
    }
}

// -------------- Resource Transfer --------------//
export interface TransferResourceTask{
    taskType: TasksType.TRANSFER_RESOURCE;
    data: {
        targetStructureId: Id<StructureContainer|StructureStorage|StructureSpawn|StructureExtension>;
        resourceType: ResourceConstant;
    }
}



export type Task<T extends TasksType> =(
      WithdrawEnergyTask 
    | ResourceMiningTask 
    | PickupResourceTask
    | TransferResourceTask
) & {taskType:T};





export type TaskHandlerFunction<T extends TasksType> = (worker: Worker<WorkerRoles,T>) => void;