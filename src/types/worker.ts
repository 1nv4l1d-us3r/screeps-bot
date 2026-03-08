import { RoleMemory, WorkerRoles } from "./roles";
import { Task } from "./tasks";


// -------------- Builder Memory --------------//


// -------------- Upgrader Memory --------------//




// -------------- Miner Memory --------------//




// -------------- Worker Memory --------------//
export interface WorkerMemory extends RoleMemory{
    role: WorkerRoles;
    task?: Task;
}
    

// -------------- Base Worker --------------//
export type BaseWorkerMemory = {}

export type BaseWorker<M extends BaseWorkerMemory> = Creep & {
    memory:  M & {task?: Task}
}

export type Worker = BaseWorker<WorkerMemory>;



// -------------- Worker Config --------------//

export interface WorkerConfig<M extends CreepMemory>{
    role: WorkerRoles;
    roleHandler: (worker: BaseWorker<M>) => void;
}


export type WorkersConfig = Record<WorkerRoles, WorkerConfig<WorkerMemory>>;
