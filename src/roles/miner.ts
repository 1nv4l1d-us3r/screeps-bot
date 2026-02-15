import { collectEnergy, EnergyCollectionMemory } from "../actions/energyCollection";
import { WorkerRoles } from "./base";

import { mineResource, ResourceMiningMemory } from "../actions/miningEnergy";

interface BaseMinerMemory extends  ResourceMiningMemory {

}

interface MinerMemory extends BaseMinerMemory{
    role: WorkerRoles.MINER;
}

export type Miner = Creep & {
    memory: MinerMemory;
}

type  BaseMiner = Creep & {
    memory: BaseMinerMemory;
}

export const minerRole = (creep: BaseMiner) => {

    if(!creep.memory.miningResourceId) {
        const miningSpots: (Source|Mineral)[] = [];

        const energySources = creep.room.find(FIND_SOURCES);
        miningSpots.push(...energySources);

        if(!miningSpots){
            creep.say('no mining spots found');
            return;
        }
        else if(miningSpots.length == 1) {
            
        }
    }
}