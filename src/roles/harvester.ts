import { collectEnergy } from "../actions/energyCollection";
import {  WorkerRoles } from "./base";
import { builderRole } from "./builder";
import { EnergyCollectionMemory } from "../actions/energyCollection";


export interface baseHarvesterMemory extends EnergyCollectionMemory{
    energyFillingStructureId?: Id<Structure>;
}

interface harvesterMemory extends baseHarvesterMemory{
    role: WorkerRoles.HARVESTER;
}

export type Harvester = Creep & {
    memory: harvesterMemory;
}

// other creeps can inherit from this memory
type BaseHarvester = Creep & {
    memory: baseHarvesterMemory;
}



export const harvesterRole = (creep:BaseHarvester) => {

    if (!creep.memory.energyFillingStructureId) {
        const energyFillingStructure = creep.pos.findClosestByRange(
            FIND_MY_STRUCTURES,
            {
                filter: (st) =>
                    (   st.structureType === STRUCTURE_SPAWN
                        || st.structureType === STRUCTURE_EXTENSION
                        || st.structureType === STRUCTURE_TOWER
                    )
                    && st.store.energy < st.store.getCapacity('energy')
            }
        );
        if(energyFillingStructure) {
            creep.memory.energyFillingStructureId = energyFillingStructure.id;
        }
        else {
            creep.say('no energy filling structure found, upgrading controller');
            builderRole(creep);
            return;
        }
    }
    if(creep.memory.energyFillingStructureId) {
        const energyFillingStructure = Game.getObjectById(creep.memory.energyFillingStructureId);
        if(energyFillingStructure) {
            const fillResult = creep.transfer(energyFillingStructure, RESOURCE_ENERGY);
            if(fillResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(energyFillingStructure);
            }
            else if(fillResult === ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.isCollectingEnergy = true;
            }
            else if(fillResult === ERR_FULL || fillResult ==ERR_INVALID_TARGET) {
                creep.memory.energyFillingStructureId = undefined;
            }
        }
    }



}

