
import { getAdjacentCoords } from "../geometry";

import {  MinerMemory, BaseWorker } from "../types/worker";


type  BaseMiner = BaseWorker<MinerMemory>;




export const minerRole = (worker: BaseMiner) => {

    if(!worker.memory.miningResourceId) {
        worker.say('yawn!...');
        return;
    }


    // find the closest storage structure to store the mined resource
    if( worker.memory.storageStructureType && !worker.memory.storageStructureId) {
        const miningResource = Game.getObjectById(worker.memory.miningResourceId);
        if(!miningResource) {
            worker.memory.miningResourceId = undefined;
            return;
        }
        const storageCoord = findStorageSpotNearMiningSpot(miningResource);
        if(!storageCoord) {
            console.log('no storage spot found near mining spot, miner is dropping resource', miningResource.id);
            worker.memory.storageStructureType = undefined;
            return;
        }
        
        const existingStructures = worker.room.lookForAt(LOOK_STRUCTURES, storageCoord.x, storageCoord.y);

        const storageStructure = existingStructures.find((st: Structure<StructureConstant>) => {
            return st.structureType === worker.memory.storageStructureType;
        }) as StructureContainer | StructureLink | undefined;

        if(storageStructure) {
            worker.memory.storageStructureId = storageStructure.id;
        }

        if(!storageStructure && existingStructures.length > 0) {
            // destroy all non-rampart structures in the storage spot
            const destroyingStructures = existingStructures.filter((st: Structure<StructureConstant>) => {
                return st.structureType !=STRUCTURE_RAMPART;
            });
            destroyingStructures.forEach(st=>st.destroy())
        }

        if(!storageStructure) {
        
            const existingConstructionSite = worker.room.lookForAt(LOOK_CONSTRUCTION_SITES, storageCoord.x, storageCoord.y);
            if(existingConstructionSite.length > 0) {
                worker.memory.storageStructureType = undefined;
                return;
            }
            const buildingResult = worker.room.createConstructionSite(storageCoord.x, storageCoord.y, worker.memory.storageStructureType);
            if(buildingResult === OK) {
                worker.memory.storageStructureType = undefined;
                return;
            }
            // set use storage structure to false ( next miner will use the storage structure)
        }

          
           
    }

    
    if(!worker.memory.isMiningResource) {

        if(!worker.memory.storageStructureType || !worker.memory.storageStructureId) {
            worker.drop(RESOURCE_ENERGY);
            worker.memory.isMiningResource = true;
        }
        else {
            const resourceStorageStructure = Game.getObjectById(worker.memory.storageStructureId);
            if(!resourceStorageStructure) {
                worker.memory.storageStructureId = undefined;
                return;
            }
            // makes sure the miner is in the container is storage structure is a container
            if(resourceStorageStructure.structureType==STRUCTURE_CONTAINER){
                if(!worker.pos.isEqualTo(resourceStorageStructure.pos)) {
                    worker.moveTo(resourceStorageStructure);
                    return;
                }
                worker.memory.isMiningResource = true;
                return;
            }
            const transferResult = worker.transfer(resourceStorageStructure, RESOURCE_ENERGY);
            if(transferResult === ERR_NOT_IN_RANGE) {
                worker.moveTo(resourceStorageStructure);
            }
            else if(transferResult === ERR_INVALID_TARGET) {
                worker.memory.storageStructureId = undefined;
                return;
            }
            else if(transferResult === ERR_NOT_ENOUGH_RESOURCES) {
                worker.memory.isMiningResource = true;
            }
        }
    }

}


// const findMiningSpotWithLeastTrafic = (room: Room): Source|Mineral|undefined => {
//     // const roomLevel = room.controller?.level || 0;
//     const miningSpots: (Source|Mineral)[] = [];
//     const energySources = room.find(FIND_SOURCES);
//     miningSpots.push(...energySources);
//     // if(roo)
//     if(!miningSpots.length) {
//         return;
//     }
//     if(miningSpots.length == 1) {
//         return miningSpots[0];
//     }
//     else {
//         const roomMiningCreeps = Object.values(Game.creeps).filter(c => c.memory.miningResourceId !== undefined);
//         const miningSpotTrafficMap=new Map<Id<Source|Mineral>, number>();
//         const miningSpotMaxMinerMap=new Map<Id<Source|Mineral>, number>();
//         const terrain = room.getTerrain();
//         miningSpots.forEach(spot => {
//             const spotMiners = roomMiningCreeps.filter(creep => creep.memory.miningResourceId == spot.id)
//             const spotMinerCount = spotMiners.length;
//             miningSpotTrafficMap.set(spot.id, spotMinerCount);

//             const walkablePositions = getAdjacentCoords(spot.pos)
//                 .filter(coord => {
//                     return terrain.get(coord.x, coord.y) != TERRAIN_MASK_WALL;
//                 });
//             const walkablePositionsCount= walkablePositions.length;
//             miningSpotMaxMinerMap.set(spot.id, walkablePositionsCount);
//             console.log('spot', spot.id, 'walkablePositionsCount', walkablePositionsCount);
//             console.log('spotMinerCount', spotMinerCount);
//         });

//         miningSpots.sort((a, b) => {return (miningSpotTrafficMap.get(a.id)||0) - (miningSpotTrafficMap.get(b.id)||0)});
//         for(let miningSpot of miningSpots) {
//             const spotMinerCount = miningSpotTrafficMap.get(miningSpot.id) || 0;
//             const spotMaxMinerCount = miningSpotMaxMinerMap.get(miningSpot.id) || 0;
//             console.log('spot', miningSpot.id, 'spotMinerCount', spotMinerCount, 'spotMaxMinerCount', spotMaxMinerCount);
//             if(spotMinerCount+1 <= spotMaxMinerCount) {
//                 return miningSpot;
//             }
//         }

//     }

// }


const findStorageSpotNearMiningSpot = (miningSpot: Source|Mineral) => {
    const room = miningSpot.room;
    if(!room) {
        return 
    }
    const terrain= room.getTerrain();

    const storageCoords = getAdjacentCoords(miningSpot.pos)
        .filter(coord => {
            return terrain.get(coord.x, coord.y) != TERRAIN_MASK_WALL;
        }
    );

    if(!storageCoords.length) {
        return;
    }
    if(storageCoords.length == 1) {
        return storageCoords[0];
    }
    else {
        let maxWalkablePositions = 0;
        let bestSpot = storageCoords[0];
        for(const storageSpot of storageCoords) {
            const walkablePositions = getAdjacentCoords(storageSpot)
                .filter(coord => {
                    return terrain.get(coord.x, coord.y) != TERRAIN_MASK_WALL;
                }
            );
            const walkablePositionsCount = walkablePositions.length;
            if(walkablePositionsCount > maxWalkablePositions) {
                maxWalkablePositions = walkablePositionsCount;
                bestSpot = storageSpot;
            }
        }
        return bestSpot;

    }
}

