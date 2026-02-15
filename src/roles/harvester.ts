import { CreepRoles } from "./base";


export interface baseHarvesterMemory{
    isHarvesting:boolean;
    targetSourceId?: Id<Source>;
}

interface harvesterMemory extends baseHarvesterMemory{
    role: CreepRoles.HARVESTER;
}

export type HarvesterCreep = Creep & {
    memory: harvesterMemory;
}

// other creeps can inherit from this memory
type BaseHarvesterCreep = Creep & {
    memory: baseHarvesterMemory;
}



export const harvesterRole = (creep: BaseHarvesterCreep) => {

    if(!creep.memory.targetSourceId) {
        const sources = creep.room.find(FIND_SOURCES);
        if(sources.length > 0) {
            creep.memory.targetSourceId = sources[0].id;
            creep.memory.isHarvesting = true;
        }
        return;
    }

    if(creep.store.getFreeCapacity() === 0) {
        creep.memory.isHarvesting = false;
    }


    if(creep.memory.isHarvesting) {
        creep.say(`harvesting source: ${creep.memory.targetSourceId}`);
        const source = Game.getObjectById(creep.memory.targetSourceId);
        if(source) {
            const harvestResult = creep.harvest(source);
            creep.say(`harvest result: ${harvestResult}`);
            if(harvestResult === ERR_NOT_IN_RANGE) {
                creep.say('not in range moving to source');
                creep.moveTo(source);
            }
            else if(harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.targetSourceId = undefined;
            }
        }
    }

    if(!creep.memory.isHarvesting) {
        creep.say('upgrading controller');


        const energyFillingStructure = creep.pos.findClosestByRange(
            FIND_MY_STRUCTURES,
            {
                filter:
                    (st) =>
                        st.structureType == STRUCTURE_SPAWN
                        || (st.structureType == STRUCTURE_EXTENSION || st.structureType == STRUCTURE_TOWER)
                        && st.store.energy < st.store.getCapacity('energy')
            }
               
        );

        if(energyFillingStructure) {
            creep.say(`filling energy to ${energyFillingStructure.id}`);
            const fillResult = creep.transfer(energyFillingStructure, RESOURCE_ENERGY);
            console.log(`fill result: ${fillResult}`);
            if(fillResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(energyFillingStructure);
            }
            else if(fillResult === ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.isHarvesting = true;
            }
        }

       
        
    }


}

