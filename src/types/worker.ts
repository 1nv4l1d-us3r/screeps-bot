import { RoleMemory, WorkerRoles } from "./roles";
import { Task, TasksType } from "./tasks";


// -------------- Builder Memory --------------//


// -------------- Upgrader Memory --------------//




// -------------- Miner Memory --------------//




// -------------- Worker Memory --------------//
interface BaseWorkerMemory{}
export interface WorkerMemory<
        R extends WorkerRoles=WorkerRoles,
        T extends TasksType=TasksType
    >{
    roleMemory: RoleMemory<R>;
    task?: Task<T>;
}


export interface Worker<
        R extends WorkerRoles=WorkerRoles,
        T extends TasksType=TasksType
    > extends Creep{
    memory: WorkerMemory<R,T>;
}

// -------------- Worker Config --------------//

export interface WorkerConfig<R extends WorkerRoles> {
    role: R;
    roleHandler: (worker: Worker<R>) => void;
}


export type WorkersConfig = Record<WorkerRoles, WorkerConfig<WorkerRoles>>;
