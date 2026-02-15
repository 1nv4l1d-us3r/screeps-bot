


export interface ResourceMiningMemory{
    isMiningResource?:boolean;
    miningResourceId?: Id<Source|Mineral>;
}

type ResourceMiningCreep = Creep & {
    memory: ResourceMiningMemory;
}

export const mineResource = (creep: ResourceMiningCreep) => {

    if(!creep.memory.miningResourceId) {
        const miningSpots: (Source|Mineral)[] = [];

        const energySources = creep.room.find(FIND_SOURCES);
        miningSpots.push(...energySources);

        if(!miningSpots){
            creep.say('no mining spots found');
            return;
        }
        else if(miningSpots.length == 1) {
            creep.memory.miningResourceId = miningSpots[0].id;
        }
        else {
            const roomMiningCreeps = creep.room.find(FIND_MY_CREEPS, {
                filter: (c) => c.memory.miningResourceId !== undefined
            }) 
            
        }
    }

    if(creep.memory.miningResourceId) {
        const miningResource = Game.getObjectById(creep.memory.miningResourceId);
        if(!miningResource) {
            creep.memory.miningResourceId = undefined;
            return;
        }
    }
}