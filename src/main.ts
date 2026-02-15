
import { WorkerRoles } from "./roles/base";
import { Worker, getWorkerHandler } from "./roles";
import { handleRoomSpawning } from "./spawning/RoomSpawning";
import { clearDeadCreepMemory } from "./cleanup";

import { collectEnergy } from "./actions/energyCollection";


export const loop = () => {

    const myCreeps = Object.values(Game.creeps).filter(creep => creep.my) as Worker[];
    myCreeps.forEach(creep => {

        if(creep.memory.isCollectingEnergy) {
            collectEnergy(creep);
            return;
        }
        const workerRole=creep.memory.role;
        const workerHandler = getWorkerHandler(creep);
        workerHandler(creep);
    });
    if(Game.time % 3 === 0) {
        const myRooms = Object.values(Game.rooms).filter(room => room.controller?.my);
        myRooms.forEach(room => {
            handleRoomSpawning(room);
        });
    }
    
    // clean ups 
    if(Game.time % 50 === 0) {
        clearDeadCreepMemory();
    }
    console.log(`Tick: ${Game.time}`);
}