
export interface EnergyCollectionMemory{
    isCollectingEnergy?:boolean;
    energySourceId?: Id<Source>;
}


type EnergyCollectingCreep = Creep & {
    memory: EnergyCollectionMemory;
}



const collectEnergyPrimitive = (creep: EnergyCollectingCreep) => {
    if(!creep.memory.energySourceId) {
        const sources = creep.room.find(FIND_SOURCES);
        if(!sources.length) {
            creep.say('no Sources')
            return;
        }
        else if(sources.length == 1) {
            creep.memory.energySourceId = sources[0].id;
        }
        else {
            const roomCollectingCreeps = creep.room.find(FIND_MY_CREEPS, {
                filter: (c) => c.memory.isCollectingEnergy !== undefined
            }) 


            const firstSource = sources[0];

            let selectedSource = firstSource;
            let leastTrafic = Infinity;

            for(const source of sources) {
                const collectorCount = roomCollectingCreeps.filter(creep => creep.memory.energySourceId  === source.id).length;
                console.log('source: ', source.id, 'collectorCount: ', collectorCount);
                if(collectorCount < leastTrafic) {
                    leastTrafic = collectorCount;
                    selectedSource = source;
                }
            }

            creep.memory.energySourceId = selectedSource.id; 
        }
    }

    if(creep.memory.energySourceId) {
        const source = Game.getObjectById(creep.memory.energySourceId);
        if(!source) {
            creep.memory.energySourceId = undefined;
            return;
        }
        if(source) {
            const harvestResult = creep.harvest(source);
            if(harvestResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }

    if(creep.store.getUsedCapacity() == creep.store.getCapacity()) {
        creep.memory.isCollectingEnergy = false;
    }
}


export const collectEnergy = (creep: EnergyCollectingCreep) => {
    collectEnergyPrimitive(creep);
}






