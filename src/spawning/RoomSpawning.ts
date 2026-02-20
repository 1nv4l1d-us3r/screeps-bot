 import { RoomPopulation,  } from "../types/room";
import { Worker} from "../types/worker";

import { getRoomPopulation } from "./RoomPopulation";
import { getWorkerSpawnPriority } from "../roles";


// -------------- Helper Functions --------------//
const getRoomSpawn = (room: Room) => {
    const freeSpawns = room.find(FIND_MY_SPAWNS).filter(spawn => spawn.spawning === null);
    if(!freeSpawns.length) {
        return null;
    }
    const firstSpawn = freeSpawns[0];
    return firstSpawn;
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

const handleRoomWorkerSpawning = (params: HandleRoomWorkerSpawningParams) => {
    const {room, roomWorkers, roomPopulation} = params;

    const aliveWorkerIds=new Set(roomWorkers.map(worker => worker.id));

    const toBeSpawnedWorkerConfigs=roomPopulation.workerSpawnConfigs.filter(
        spawnConfig => !aliveWorkerIds.has(spawnConfig.workerId)
    );

    toBeSpawnedWorkerConfigs.sort((a, b) => getWorkerSpawnPriority(a.memory.role) - getWorkerSpawnPriority(b.memory.role));

    for(const spawnConfig of toBeSpawnedWorkerConfigs) {
        const spawn=getRoomSpawn(room);
        if(!spawn) {
            return;
        }
        const spawnResult = spawn.spawnCreep(spawnConfig.bodyParts, spawnConfig.workerId, {memory: spawnConfig.memory});
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

