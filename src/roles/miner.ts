import { ResourceMiningMemory } from "../actions/resourceMining";
import { WorkerRoles } from "./base";

import { getGridAroundPosition, getAdjacentPositions } from "../grid/utils";
export interface MinerMemory extends  ResourceMiningMemory {
    useStorageStructure?: boolean;
    storageStructureId?: Id<StructureContainer | StructureLink>;


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
            creep.memory.miningResourceId = miningSpots[0].id;
        }
        else {
            const roomMiningCreeps = creep.room.find(FIND_MY_CREEPS, {
                filter: (c) => c.memory.miningResourceId !== undefined
            })
            const firstMiningSpot = miningSpots[0];
            let selectedMiningSpot = firstMiningSpot;
            let leastTrafic = Infinity;

            for(const miningSpot of miningSpots) {
                const minerCount = roomMiningCreeps.filter(creep => creep.memory.miningResourceId == miningSpot.id).length;
                console.log('miningSpot', miningSpot.id);
                console.log('attached miners', minerCount);
                if(minerCount < leastTrafic) {
                    leastTrafic = minerCount;
                    selectedMiningSpot = miningSpot;
                }
            }
            console.log('selectedMiningSpot', selectedMiningSpot.id);
            console.log('leastTrafic', leastTrafic);
            creep.memory.miningResourceId = selectedMiningSpot.id;
            const roomLevel = creep.room.controller?.level || 0;
            if(roomLevel > 1) {
                creep.memory.useStorageStructure = true;
            }
        }
    }


    // find the closest storage structure to store the mined resource
    if(!creep.memory.storageStructureId && creep.memory.useStorageStructure) {
        const miningResource = Game.getObjectById(creep.memory.miningResourceId);
        if(!miningResource) {
            creep.memory.miningResourceId = undefined;
            return;
        }
        const storageStructure = creep.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: (st) => (
                st.structureType === STRUCTURE_LINK || st.structureType === STRUCTURE_CONTAINER 
                ) 
        })
        if(storageStructure.length > 0) {
            creep.memory.storageStructureId = storageStructure[0].id;
        }
        else {
            const containerSpot = findContainerBuildingSpotNearMiningSpot(miningResource);
            if(!containerSpot) {
                creep.memory.useStorageStructure = false;
                return;
            }
            const existingConstructionSite =containerSpot.lookFor(LOOK_CONSTRUCTION_SITES);
            if(existingConstructionSite.length > 0) {
                // will be used by the next miner
                creep.memory.useStorageStructure = false;
                return;
            }

            const buildingResult = containerSpot.createConstructionSite(STRUCTURE_CONTAINER);
            if(buildingResult === OK ) {
                // will be used by the next miner
                creep.memory.useStorageStructure =false;
                return 
            }
            console.log('failed to build container near mining spot', miningResource.id);
            console.log('containerSpot', containerSpot);
            console.log('buildingResult', buildingResult);
        }

          
           
    }

    
    if(!creep.memory.isMiningResource) {

        if(!creep.memory.useStorageStructure || !creep.memory.storageStructureId) {
            creep.drop(RESOURCE_ENERGY);
            creep.memory.isMiningResource = true;
        }
        else {
            const resourceStorageStructure = Game.getObjectById(creep.memory.storageStructureId);
            if(!resourceStorageStructure) {
                creep.memory.storageStructureId = undefined;
                return;
            }
            const transferResult = creep.transfer(resourceStorageStructure, RESOURCE_ENERGY);
            if(transferResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(resourceStorageStructure);
            }
            else if(transferResult === ERR_INVALID_TARGET) {
                creep.memory.storageStructureId = undefined;
                return;
            }
            else if(transferResult === ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.isMiningResource = true;
            }
        }
    }

}


const findContainerBuildingSpotNearMiningSpot = (miningSpot: Source|Mineral) => {
    const room = miningSpot.room;
    if(!room) {
        return 
    }
    const terrain= room.getTerrain();

    const adjacentPositions = getAdjacentPositions(miningSpot.pos);

    const minablePositions = adjacentPositions.filter(pos => {
        return terrain.get(pos.x, pos.y) != TERRAIN_MASK_WALL;
    });

    const containerPositions: RoomPosition[] = [];
    for(const pos of minablePositions) {
        const ajcToMinable = getAdjacentPositions(pos);
        const validSpots = ajcToMinable.filter(pos => {
            return (
                !pos.isEqualTo(miningSpot.pos)
                && terrain.get(pos.x, pos.y) != TERRAIN_MASK_WALL
            )
        });
        containerPositions.push(...validSpots)
    }
    if(containerPositions.length === 0) {
        console.log('no container spots found for mining spot',miningSpot.id);
        return
    }
    // best container spot has most adjacent minable positions
    const firstpos = containerPositions[0];
    let bestSpot = firstpos;
    let maxAdjacentMinable = 0;
    for(const pos of containerPositions) {
       const freq=containerPositions.filter(p => p.x === pos.x && p.y === pos.y).length;
       if(freq > maxAdjacentMinable) {
        maxAdjacentMinable = freq;
        bestSpot = pos;
       }
    }
    return bestSpot;
}

