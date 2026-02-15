import { WorkerRoles, WorkerSpawnOrder } from "../roles/base"; 
import { WorkerCreepMemory } from "../roles";


interface WorkerBodyPartsConfig {
    repeatingParts: BodyPartConstant[];
    fixedParts?: BodyPartConstant[];
}

const WorkerBodyPartsConfig: Record<WorkerRoles, WorkerBodyPartsConfig> = {
    [WorkerRoles.HARVESTER]: { 
        repeatingParts: [WORK, CARRY, MOVE, MOVE] 
    },
    [WorkerRoles.UPGRADER]: { 
        repeatingParts: [WORK, CARRY, MOVE, MOVE] 
    },
    [WorkerRoles.BUILDER]: { 
        repeatingParts: [WORK, CARRY, MOVE, MOVE] 
    },
    [WorkerRoles.MINER]: { 
        repeatingParts: [WORK, MOVE], fixedParts: [CARRY] 
    },
}



const getWorkerBodyParts = (budget: number,bodyParts: BodyPartConstant[]) => {

    const bodyPartsSetCost = bodyParts.reduce((acc, part) => acc + BODYPART_COST[part], 0);

    const affordableSetCount = Math.floor(budget / bodyPartsSetCost);

    console.log(`Affordable Set Count: ${affordableSetCount}`);
    console.log(`Body Parts Set Cost: ${bodyPartsSetCost}`);
    console.log(`Budget: ${budget}`);
    console.log(`Body Parts: ${bodyParts.join(', ')}`);
    

    let bodyArray: BodyPartConstant[]=[];

    if(affordableSetCount <=1) {
        bodyArray = bodyParts
    }
    else {
        for(let i = 0; i < affordableSetCount; i++) {
            bodyArray.push(...bodyParts);
        }
    }
    return bodyArray;
}




type RoomWorkerCounts = Partial<Record<WorkerRoles, number>>;

const getDesiredWorkerCountForRoom = (room: Room):RoomWorkerCounts => {

    const roomWorkerCount: RoomWorkerCounts = {};
    const roomLevel = room.controller?.level || 0;

    if(roomLevel ==1) {
      roomWorkerCount[WorkerRoles.HARVESTER] = 6;
    }
    else {
        const sources=room.find(FIND_SOURCES)
        roomWorkerCount[WorkerRoles.HARVESTER] = 4;
        roomWorkerCount[WorkerRoles.UPGRADER] = 1;
        roomWorkerCount[WorkerRoles.BUILDER] = 1;
        roomWorkerCount[WorkerRoles.MINER] = sources.length;
    }
    return roomWorkerCount;
}

const getRoomWorkerPopulationForRoom = (room: Room):RoomWorkerCounts=> {
    const roomWorkerCount: RoomWorkerCounts = {};

    const roomCreeps = Object.values(Game.creeps).filter(creep => creep.my && creep.room.name === room.name) 

    roomCreeps.forEach(creep => {
        roomWorkerCount[creep.memory.role] = (roomWorkerCount[creep.memory.role] || 0) + 1;
    });
    return roomWorkerCount;
}




const getRoomSpawns = (room: Room) => {
    const freeSpawns = room.find(FIND_MY_SPAWNS).filter(spawn => spawn.spawning === null);
    if(!freeSpawns.length) {
        return null;
    }
    const firstSpawn = freeSpawns[0];
    return firstSpawn;
}


const spawnWorker = (role: WorkerRoles,spawn:StructureSpawn,budget:number) => {
    const creepBodyConfig=WorkerBodyPartsConfig[role];

    const repeatingParts = creepBodyConfig.repeatingParts;
    const fixedParts = creepBodyConfig.fixedParts || [];

    const creepParts: BodyPartConstant[] = [];
    let remainingBudget = budget;
    
    if(fixedParts.length > 0) {
        creepParts.push(...fixedParts);
        const fixedPartsCost = fixedParts.reduce((acc, part) => acc + BODYPART_COST[part], 0);
        remainingBudget -= fixedPartsCost;
    }
    const AutoScaledRepeatingParts = getWorkerBodyParts(remainingBudget, repeatingParts);

    if(AutoScaledRepeatingParts.length > 0) {
        creepParts.push(...AutoScaledRepeatingParts);
    }

    const newCreepName = `worker-${role}-${Game.time}`;
    const newCreepMemory:WorkerCreepMemory = {
        role: role         
    }
    const spawnResult=spawn.spawnCreep(
        creepParts, 
        newCreepName, 
        {
            memory: newCreepMemory  
        }
    );
    return spawnResult;
}




export const handleRoomSpawning = (room: Room) => {
    const desiredWorkerCount = getDesiredWorkerCountForRoom(room);
    const roomWorkerPopulation = getRoomWorkerPopulationForRoom(room);
    const desiredWorkerCountTotal = Object.values(desiredWorkerCount).reduce((acc, count) => acc + count, 0);
    const roomWorkerPopulationTotal = Object.values(roomWorkerPopulation).reduce((acc, count) => acc + count, 0);

    if(roomWorkerPopulationTotal < desiredWorkerCountTotal) {
        const RolesToSpawn = Object.keys(desiredWorkerCount)
            .sort((a, b) => WorkerSpawnOrder[a as WorkerRoles] - WorkerSpawnOrder[b as WorkerRoles]
        ) as WorkerRoles[];

        for (const role of RolesToSpawn) {
            const desiredCount = desiredWorkerCount[role] || 0;
            const presentCount = roomWorkerPopulation[role] || 0;

            if(presentCount < desiredCount) {
                const spawn = getRoomSpawns(room);
                if(!spawn) {
                    return 
                }
                const spawnBudget = spawn.room.energyCapacityAvailable;
                const spawnResult = spawnWorker(role, spawn, spawnBudget);
                if(spawnResult ==OK) {
                    return;
                }
                if(spawnResult === ERR_NOT_ENOUGH_ENERGY) {
                    return;
                }
            }
        }
    }

   
}
