


export interface ResourceMiningMemory{
    isMiningResource?:boolean;
    miningResourceId?: Id<Source|Mineral>;
}

type ResourceMiningCreep = Creep & {
    memory: ResourceMiningMemory;
}

export const mineResource = (creep: ResourceMiningCreep) => {

    
    if(creep.memory.miningResourceId) {
        const miningResource = Game.getObjectById(creep.memory.miningResourceId);
        if(!miningResource) {
            creep.memory.isMiningResource = false;
            creep.memory.miningResourceId = undefined;
            return;
        }
        const mineResult = creep.harvest(miningResource);
        if(mineResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(miningResource);
        }
        else if(mineResult === ERR_INVALID_TARGET) {
            creep.memory.miningResourceId = undefined;
        }
    }

    if(creep.store.getFreeCapacity() === 0) {
        creep.memory.isMiningResource = false;
    }
}