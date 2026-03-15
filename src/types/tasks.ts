import { WorkerRoles } from "./roles";
import { Worker, WorkerMemory } from "./worker";

export enum TasksType{
    PICKUP_RESOURCE = "PICKUP_RESOURCE",
    WITHDRAW_RESOURCE = "WITHDRAW_RESOURCE",
    TRANSFER_RESOURCE = "TRANSFER_RESOURCE",
    MINE_RESOURCE = "MINE_RESOURCE",
    // BUILD_STRUCTURE = "BUILD_STRUCTURE",
}





// -------------- Resource Pickup --------------//
export interface PickupResourceTask{
    taskType: TasksType.PICKUP_RESOURCE;
    data: {
        droppedResourceId: Id<Resource>;
    }
}


// -------------- Resource Withdraw --------------//
export interface WithdrawResourceTask{
    taskType: TasksType.WITHDRAW_RESOURCE;
    data: {
        withdrawStructureId?: (Id<StructureContainer|StructureStorage |StructureSpawn |StructureLink> | 'auto');
        resourceType: ResourceConstant;
    }
}

// -------------- Resource Transfer --------------//
export interface TransferResourceTask{
    taskType: TasksType.TRANSFER_RESOURCE;
    data: {
        targetStructureId: (Id<StructureContainer|StructureStorage|StructureSpawn|StructureExtension |StructureTower> | 'auto');
        resourceType: ResourceConstant;
    }
}

// -------------- Resource Mining --------------//
export interface ResourceMiningTask{
    taskType: TasksType.MINE_RESOURCE;
    data: {
        resourceId: Id<Source|Mineral>;   
    }
}


export type Task<T extends TasksType> =(
    | ResourceMiningTask 
    | PickupResourceTask
    | TransferResourceTask
    | WithdrawResourceTask
) & {taskType:T};





export type TaskHandlerFunction<T extends TasksType> = (worker: Worker<WorkerRoles,T>) => void;