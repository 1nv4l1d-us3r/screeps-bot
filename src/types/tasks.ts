import { Worker, WorkerMemory } from "./worker";

export enum TasksType{
    WITHDRAW_ENERGY = "WITHDRAW_ENERGY",
    PICKUP_RESOURCE = "PICKUP_RESOURCE",
    // DEPOSIT_ENERGY = "DEPOSIT_ENERGY",
    MINE_RESOURCE = "MINE_RESOURCE",
    // BUILD_STRUCTURE = "BUILD_STRUCTURE",
}

// -------------- Energy Collection --------------//
export interface WithdrawEnergyTask{
    taskType: TasksType.WITHDRAW_ENERGY;
    data: {
        withdrawStructureId?: Id<StructureContainer|StructureStorage>;
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



export type Task = WithdrawEnergyTask | ResourceMiningTask | PickupResourceTask;


export type TaskWorker<T extends Task['taskType']> = Worker & {memory:WorkerMemory & {task:Task & {taskType:T}}};


export type TaskHandlerFunction<T extends Task['taskType']> = (worker: TaskWorker<T>) => void;