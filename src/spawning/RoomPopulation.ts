
import { findCenterCoord, getCoordDistance } from "../geometry";
import { WorkerRoles, WorkerMemory, Worker } from "../types/worker";
import { getAutoScaledBodyParts, getBodyPartsCost } from "./common";

import { getMaxLinksByLevel } from "../gameConstants";


import { RoomPopulation, WorkerSpawnConfig } from "../types/room";
import { Coord } from "../types/geometry";


export const updateWorkerPopulation = (myRooms: Room[]) => {

    myRooms.forEach(room => {
        const roomPopulation = getRoomPopulation(room);
        room.memory.roomPopulation = roomPopulation;
    });

}



export const getRoomPopulation = (room: Room) => {

    const roomWorkerSpawnConfigs: WorkerSpawnConfig[] = [];

        // using a record to store the worker configs for each worker role.
        // makes sure all the worker roles are accounted for.
    const roomWorkerConfigs:Record<WorkerRoles, WorkerSpawnConfig[]>={
        [WorkerRoles.HARVESTER]: getHarvestersSpawnDetails(room),
        [WorkerRoles.UPGRADER]: getUpgradersSpawnDetails(room),
        [WorkerRoles.BUILDER]: getBuildersSpawnDetails(room),
        [WorkerRoles.MINER]: getMinersSpawnDetails(room),
    }

    for(const workerRole of Object.values(WorkerRoles)) {
        const workerSpawnConfigs = roomWorkerConfigs[workerRole];
        roomWorkerSpawnConfigs.push(...workerSpawnConfigs);
    }
    const roomPopulation: RoomPopulation = {
        totalWorkers: roomWorkerSpawnConfigs.length,
        workerSpawnConfigs: roomWorkerSpawnConfigs
    }
    return roomPopulation;
}


type WorkerMemoryWithoutId = Omit<WorkerMemory, 'workerId'>;
/*
generic function to get the spawn configuration for a simple worker.
creates a array of worker configs for the given number of workers.
*/
interface GetSimpleWorkerSpawnDetailsParams {
    room:Room
    bodyParts: BodyPartConstant[]
    optimalBodyParts: BodyPartConstant[]
    memory: WorkerMemoryWithoutId
    workerCount: number
}

const getSimpleWorkerSpawnConfig=(params: GetSimpleWorkerSpawnDetailsParams) => {

    const {room,bodyParts,optimalBodyParts,memory,workerCount} = params;
    return Array(workerCount).fill(0).map((_,index)=>{
        const workerId = `${memory.role}-${room.name}-${index}` as Id<Worker>;
        return {
            workerId: workerId,
            bodyParts: bodyParts,
            optimalBodyParts: optimalBodyParts,
            memory: {
                ...memory,
                workerId: workerId
            }
        }
    });
}



/*
Get the spawn configuration for the harvesters in the room.
replicate the same body parts for all the harvesters.
*/
const getHarvestersSpawnDetails = (room: Room) => {
    const roomLevel = room.controller?.level || 0;
    const harvesterCount = roomLevel == 1 ? 6 : 4;
    const roomSpawnBudget = room.energyCapacityAvailable;
    const harvesterOptimalBodyParts=[WORK,CARRY,MOVE,MOVE];
    const harvesterAutoScaleBodyParts=[WORK,CARRY,MOVE];
    const harvesterBody=roomLevel==1 ?harvesterOptimalBodyParts:getAutoScaledBodyParts(harvesterAutoScaleBodyParts,roomSpawnBudget,15);
    const harvesterSpawnDetails = getSimpleWorkerSpawnConfig({
        room,
        bodyParts: harvesterBody,
        optimalBodyParts: harvesterBody,
        memory: {
            role: WorkerRoles.HARVESTER
        },
        workerCount: harvesterCount
    });
    return harvesterSpawnDetails;
}



const getUpgradersSpawnDetails = (room: Room) => {
    const roomLevel = room.controller?.level || 0;
    let upgraderCount = roomLevel == 1 ? 1 : Math.min(1,roomLevel);
    const roomSpawnBudget = room.energyCapacityAvailable;
    const upgraderOptimalBodyParts=[WORK,CARRY,MOVE,MOVE];
    const upgraderAutoScaleBodyParts=[WORK,CARRY,MOVE];
    const upgraderBody=roomLevel==1 ?upgraderOptimalBodyParts:getAutoScaledBodyParts(upgraderAutoScaleBodyParts,roomSpawnBudget,15);
    const upgraderSpawnDetails = getSimpleWorkerSpawnConfig({
        room,
        bodyParts: upgraderBody,
        optimalBodyParts: upgraderBody,
        memory: {
            role: WorkerRoles.UPGRADER
        },
        workerCount: upgraderCount
    });
    return upgraderSpawnDetails;
}




const getBuildersSpawnDetails = (room: Room) => {
    const roomLevel = room.controller?.level || 0;
    let builderCount = roomLevel == 1 ? 1 : Math.min(1,roomLevel);
    const roomSpawnBudget = room.energyCapacityAvailable;
    const builderOptimalBodyParts=[WORK,CARRY,MOVE,MOVE];
    const builderAutoScaleBodyParts=[WORK,CARRY,MOVE];
    const builderBody=roomLevel==1 ?builderOptimalBodyParts:getAutoScaledBodyParts(builderAutoScaleBodyParts,roomSpawnBudget,15);
    const builderSpawnDetails = getSimpleWorkerSpawnConfig({
        room,
        bodyParts: builderBody,
        optimalBodyParts: builderBody,
        memory: {
            role: WorkerRoles.BUILDER
        },
        workerCount: builderCount
    });
    return builderSpawnDetails;
}


const getMinersSpawnDetails = (room: Room) => {
    const roomLevel = room.controller?.level || 0;
    if(roomLevel<2) {
        return [];
    }

    const minerOptimalBodyParts=[WORK,WORK,MOVE];
    const minerFixedBodyParts=[MOVE];
    const minerAutoScaleBodyParts=[WORK];

    let baseCenterCoord:Coord

    const roomStorage=room.storage;
    if(roomStorage) {
        baseCenterCoord={x:roomStorage.pos.x, y:roomStorage.pos.y};
    }
    else {
        const roomSpawns=room.find(FIND_MY_SPAWNS);
        const roomSpawnsCoords=roomSpawns.map(spawn => ({x:spawn.pos.x, y:spawn.pos.y}) as Coord);
        baseCenterCoord=findCenterCoord(roomSpawnsCoords);
    }

   
    const sources=room.find(FIND_SOURCES);

    const sourceDistanceMap=new Map<Id<Source>, number>();
    
    sources.forEach(source => {
        const sourceCoord={x:source.pos.x, y:source.pos.y} as Coord;
        const distanceToBase=getCoordDistance(sourceCoord, baseCenterCoord);
        sourceDistanceMap.set(source.id, distanceToBase);
    });
    sources.sort((a,b)=>{return (sourceDistanceMap.get(a.id)||0) - (sourceDistanceMap.get(b.id)||0)});

    const energyMinersSpawnConfigs: WorkerSpawnConfig[] = [];
    const roomSpawnBudget = room.energyCapacityAvailable;

    const maxLinksCount=getMaxLinksByLevel(roomLevel);
    let linksAvailable=maxLinksCount-1  // 1 link is reserved for the base reciever

    sources.forEach(source => {
        const distanceToBase=sourceDistanceMap.get(source.id)||0;
        let useLinkStorage:boolean=false;
        if(distanceToBase>20 && linksAvailable>0) {
            useLinkStorage=true;
            linksAvailable--;
        }
        const minerStorageType=useLinkStorage?STRUCTURE_LINK:STRUCTURE_CONTAINER;
        const miningResourceId=source.id;

        const workPartsRequired=getWorkPartsRequiredForSourceMining(source);
        
        const minerBodyParts: BodyPartConstant[]=[MOVE];
        const spentBudget=getBodyPartsCost(minerBodyParts);
        const remainingBudget=roomSpawnBudget-spentBudget;
        const autoScaledBodyParts=getAutoScaledBodyParts([WORK],remainingBudget,workPartsRequired);
        minerBodyParts.push(...autoScaledBodyParts);

        const minerWorkerId = `${WorkerRoles.MINER}-${room.name}-${source.id}` as Id<Worker>;
        const minerMemory: WorkerMemory = {
            role: WorkerRoles.MINER,
            workerId: minerWorkerId,
            miningResourceId: miningResourceId,
            storageStructureType: minerStorageType,
        }
        energyMinersSpawnConfigs.push({
            workerId: minerWorkerId,
            bodyParts: minerBodyParts,
            optimalBodyParts: minerOptimalBodyParts,
            memory: minerMemory
        });
    });

    return energyMinersSpawnConfigs;

    // TODO: add the spawn config for mineral miners if they are required.


}



/*
Get the number of work parts required to mine the source.
based on the source energy capacity and the energy regeneration rate.
*/
const getWorkPartsRequiredForSourceMining = (source: Source) => {
    const sourceEnergyCapacity=source.energyCapacity;
    const energyRegenTime=300; // 300 ticks per energy generation
    const regenRate= Math.ceil(sourceEnergyCapacity/energyRegenTime);
    return Math.ceil(regenRate/HARVEST_POWER);
}