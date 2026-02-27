 import { RoomPopulation,  } from "../types/room";
import { Worker} from "../types/worker";

import { getRoomPopulation } from "./RoomPopulation";
import { getWorkerSpawnPriority } from "../roles";


// -------------- Helper Functions --------------//
const getRoomSpawns = (room: Room) => {
    const freeSpawns = room.find(FIND_MY_SPAWNS).filter(spawn => spawn.spawning === null);
    return freeSpawns;
}


const getRoomWorkers=(room: Room)=> {
    return Object.values(Game.creeps).filter(creep => creep.my && creep.room.name === room.name);
}


// -------------- Main Functions --------------//


interface HandleRoomWorkerSpawningParams {
    room: Room;
    roomWorkers: Worker[];
    roomPopulation: RoomPopulation;
}

export const handleRoomWorkerSpawning = (params: HandleRoomWorkerSpawningParams) => {
    const {room, roomWorkers, roomPopulation} = params;

    const aliveWorkerIds=new Set(roomWorkers.map(worker => worker.memory.workerId));
    
    const aliveWorkerCount=aliveWorkerIds.size;
    const optimalWorkerCount=(roomPopulation.totalWorkers/3);
    const isWorkerCountBelowOptimal=(aliveWorkerCount<1 || aliveWorkerCount<=optimalWorkerCount);

    const optimalRoomEnergy=room.energyCapacityAvailable/3;

    const isRoomEnergyBelowOptimal=(room.energyAvailable<=300 || room.energyAvailable<=optimalRoomEnergy);
    const isRoomStruggling=isWorkerCountBelowOptimal && isRoomEnergyBelowOptimal;

    

    const toBeSpawnedWorkerConfigs=roomPopulation.workerSpawnConfigs.filter(
        spawnConfig => !aliveWorkerIds.has(spawnConfig.workerId)
    );

    toBeSpawnedWorkerConfigs.sort((a, b) => getWorkerSpawnPriority(a.memory.role) - getWorkerSpawnPriority(b.memory.role));

   

    const roomSpawns=getRoomSpawns(room);
    if(!roomSpawns.length) {
        return;
    }

    for(const spawnConfig of toBeSpawnedWorkerConfigs) {
       
        const spawn=roomSpawns.pop();
        if(!spawn) {
            break;
        }
        const workerName=spawnConfig.workerId
        const workerMemory=spawnConfig.memory;
        const workerBodyParts=isRoomStruggling?spawnConfig.optimalBodyParts:spawnConfig.bodyParts;
        const spawnResult = spawn.spawnCreep(workerBodyParts, workerName, {memory: workerMemory});
        if(spawnResult === OK) {
            continue;
        }
        if(spawnResult === ERR_NOT_ENOUGH_ENERGY) {
            return;
        }
    }
}


export const handleWorkerSpawning = () => {


    for(const room of Object.values(Game.rooms)) {
        if(!room.controller?.my) {continue;}
        let roomPopulation=room.memory.roomPopulation;
        if(!roomPopulation) {
            roomPopulation=getRoomPopulation(room);
            room.memory.roomPopulation = roomPopulation;
        }
        const roomWorkers=getRoomWorkers(room);
        if(roomWorkers.length<roomPopulation.totalWorkers) {
            handleRoomWorkerSpawning({room, roomWorkers, roomPopulation});
        }
    }
}

