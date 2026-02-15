
export interface EnergyCollectionMemory{
    isCollectingEnergy?:boolean;

    energyStorageStructureId?: Id<StructureContainer>;
    energyDroppedResourceId?: Id<Resource>;
}


type EnergyCollectingCreep = Creep & {
    memory: EnergyCollectionMemory;
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
        const roomCollectingCreeps = room.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.isCollectingEnergy !== undefined
        })
        let leastTrafic = Infinity;
        let selectedSource = sources[0];
        for(const source of sources) {
            const collectorCount = roomCollectingCreeps.filter(creep => creep.memory.miningResourceId  === source.id).length;
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
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store.energy > 0
    })
    if(!storageStructures.length) {
        return;
    }
    if(storageStructures.length == 1) {
        return storageStructures[0];
    }
    else {
        const roomCollectingCreeps = room.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.energyStorageStructureId !== undefined
        })
        const firstStorageStructure = storageStructures[0];
        let leastTrafic = Infinity;
        let selectedStorageStructure = firstStorageStructure;
        for(const storageStructure of storageStructures) {
            const collectorCount = roomCollectingCreeps.filter(creep => creep.memory.energyStorageStructureId == storageStructure.id).length;
            if(collectorCount < leastTrafic) {
                leastTrafic = collectorCount;
                selectedStorageStructure = storageStructure;
            }
        }
        return selectedStorageStructure;
    }
}

const findNearestEnergyResource = (creep:Creep) => {

    const closestResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.resourceType === RESOURCE_ENERGY
    })
    if(!closestResource) {
        return;
    }
    return closestResource;
}




export const collectEnergy = (creep: EnergyCollectingCreep) => {
    const roomLevel = creep.room.controller?.level || 0;

    if(roomLevel == 1) {
        const creepRoom = creep.room;
        const leastTraficSource = findLeastTraficSource(creepRoom);
        if(!leastTraficSource) {
            return;
        }
        creep.memory.isCollectingEnergy = false;
        creep.memory.isMiningResource = true;
        creep.memory.miningResourceId = leastTraficSource.id;
        return;
    }

    if(!creep.memory.energyStorageStructureId && !creep.memory.energyDroppedResourceId) {
        const leastTraficStorageStructure = findLeastTraficEnergyStorageStructure(creep.room);
        if(!leastTraficStorageStructure) {
            const nearestResource = findNearestEnergyResource(creep);
            if(!nearestResource) {
                return;
            }
            creep.memory.energyDroppedResourceId = nearestResource.id;
            return;
        }
        else {
            creep.memory.energyStorageStructureId = leastTraficStorageStructure.id;
            return;
        }
    }

    if(creep.memory.energyStorageStructureId) {
        const energyStorageStructure = Game.getObjectById(creep.memory.energyStorageStructureId);
        if(!energyStorageStructure) {
            creep.memory.energyStorageStructureId = undefined;
            return;
        }
        const withdrawResult = creep.withdraw(energyStorageStructure, RESOURCE_ENERGY);
        if(withdrawResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(energyStorageStructure);
        }
        else if(withdrawResult === ERR_INVALID_TARGET || withdrawResult === ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.energyStorageStructureId = undefined;
            return;
        }
      
    }

    if(creep.memory.energyDroppedResourceId) {
        const energyResource = Game.getObjectById(creep.memory.energyDroppedResourceId);
        if(!energyResource) {
            creep.memory.energyDroppedResourceId = undefined;
            return;
        }
        const transferResult = creep.pickup(energyResource);
        if(transferResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(energyResource);
        }
        else if(transferResult === ERR_INVALID_TARGET) {
            creep.memory.energyDroppedResourceId = undefined;
            return;
        }
    }
    if(creep.store.getFreeCapacity() === 0) {
        creep.memory.isCollectingEnergy = false;
        return;
    }


}






