import { ResourceMiningMemory } from "../actions/resourceMining";
import { WorkerRoles } from "./base";

export interface MinerMemory extends  ResourceMiningMemory {

}

type  BaseMiner = Creep & {
    memory: MinerMemory;
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