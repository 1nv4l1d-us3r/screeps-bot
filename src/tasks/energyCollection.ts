
export enum TasksType{
    WITHDRAW_ENERGY = "WITHDRAW_ENERGY",
    DEPOSIT_ENERGY = "DEPOSIT_ENERGY",
    MINE_RESOURCE = "MINE_RESOURCE",
    BUILD_STRUCTURE = "BUILD_STRUCTURE",
}


interface Task{
    type: TasksType;
    data?: Record<string, any>;
}

export interface WithdrawEnergyTask extends Task{
    type: TasksType.WITHDRAW_ENERGY;
    data?: {
        withdrawStructureId?: Id<StructureContainer>;
    }
}


export interface WithdrawEnergyMemory{
    task: WithdrawEnergyTask;
}


type WithdrawEnergyWorker = Creep & {
    memory: WithdrawEnergyMemory;
}


const findLeastTraficSource = (room: Room) => {
    const sources = room.find(FIND_SOURCES);
    if(!sources.length) {
        return;
    }
    if(sources.length == 1) {
        return sources[0];
    }
    else {
        const roomCollectingworkers = room.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.isCollectingEnergy !== undefined
        })
        let leastTrafic = Infinity;
        let selectedSource = sources[0];
        for(const source of sources) {
            const collectorCount = roomCollectingworkers.filter(worker => worker.memory.miningResourceId  === source.id).length;
            if(collectorCount < leastTrafic) {
                leastTrafic = collectorCount;
                selectedSource = source;
            }
        }
        return selectedSource;
    }
}


const findLeastTraficEnergyStorageStructure = (room: Room) => {
    const storageStructures: StructureContainer[] = room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store.energy > 50
    })
    if(!storageStructures.length) {
        return;
    }
    if(storageStructures.length == 1) {
        return storageStructures[0];
    }
    else {
        const roomCollectingworkers = room.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.energyStorageStructureId !== undefined
        })
        const firstStorageStructure = storageStructures[0];
        let leastTrafic = Infinity;
        let selectedStorageStructure = firstStorageStructure;
        for(const storageStructure of storageStructures) {
            const collectorCount = roomCollectingworkers.filter(worker => worker.memory.energyStorageStructureId == storageStructure.id).length;
            if(collectorCount < leastTrafic) {
                leastTrafic = collectorCount;
                selectedStorageStructure = storageStructure;
            }
        }
        return selectedStorageStructure;
    }
}

const findNearestEnergyResource = (worker:WithdrawEnergyWorker) => {

    const closestResource = worker.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.resourceType === RESOURCE_ENERGY
    })
    if(!closestResource) {
        return;
    }
    return closestResource;
}




export const collectEnergy = (worker: WithdrawEnergyWorker) => {

    const task = worker.memory.task;

    if(!task || task.data?.withdrawStructureId) {
        // const findRoomSinks
    }

    if(task.data?.withdrawStructureId) {
        const withdrawStructure = Game.getObjectById(task.data.withdrawStructureId);
        if(!withdrawStructure) {
            return;
        }
        const roomLevel = worker.room.controller?.level || 0;

        if(roomLevel == 1) {
            const workerRoom = worker.room;
            const leastTraficSource = findLeastTraficSource(workerRoom);
            if(!leastTraficSource) {
                return;
            }
            worker.memory.isCollectingEnergy = false;
            worker.memory.isMiningResource = true;
            worker.memory.miningResourceId = leastTraficSource.id;
            return;
        }
    }

    if(!worker.memory.energyStorageStructureId && !worker.memory.energyDroppedResourceId) {
        const leastTraficStorageStructure = findLeastTraficEnergyStorageStructure(worker.room);
        if(!leastTraficStorageStructure) {
            const nearestResource = findNearestEnergyResource(worker);
            if(!nearestResource) {
                if(worker.store.getUsedCapacity() > worker.store.getCapacity()/2) {
                    worker.memory.isCollectingEnergy = false;
                }
                return;
            }
            worker.memory.energyDroppedResourceId = nearestResource.id;
            return;
        }
        else {
            worker.memory.energyStorageStructureId = leastTraficStorageStructure.id;
            return;
        }
    }

    if(worker.memory.energyStorageStructureId) {
        const energyStorageStructure = Game.getObjectById<StructureContainer>(worker.memory.energyStorageStructureId);
        if(!energyStorageStructure) {
            worker.memory.energyStorageStructureId = undefined;
            return;
        }
        const withdrawResult = worker.withdraw(energyStorageStructure, RESOURCE_ENERGY);
        if(withdrawResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(energyStorageStructure);
        }
        else if(withdrawResult === ERR_INVALID_TARGET || energyStorageStructure.store.energy < 50) {
            worker.memory.energyStorageStructureId = undefined;
            return;
        }
      
    }

    if(worker.memory.energyDroppedResourceId) {
        const energyResource = Game.getObjectById(worker.memory.energyDroppedResourceId);
        if(!energyResource) {
            worker.memory.energyDroppedResourceId = undefined;
            return;
        }
        const transferResult = worker.pickup(energyResource);
        if(transferResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(energyResource);
        }
        else if(transferResult === ERR_INVALID_TARGET) {
            worker.memory.energyDroppedResourceId = undefined;
            return;
        }
    }
    if(worker.store.getFreeCapacity() === 0) {
        worker.memory.isCollectingEnergy = false;
        return;
    }
}







