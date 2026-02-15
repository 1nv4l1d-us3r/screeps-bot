
import { WorkerRoles } from "./roles/base";
import { getWorkerHandler } from "./roles";
import { handleRoomSpawning } from "./spawning/RoomSpawning";
import { clearDeadCreepMemory } from "./cleanup";

import { collectEnergy } from "./actions/energyCollection";
import { mineResource } from "./actions/resourceMining";


export const loop = () => {

    const myCreeps = Object.values(Game.creeps).filter(creep => creep.my);
    myCreeps.forEach(creep => {
        if (creep.memory.role) {
            collectEnergy(creep);
            return;
        }
        if (creep.memory.isMiningResource) {
            mineResource(creep);
            return;
        }
        const workerRole = creep.memory.role;
        const workerHandler = getWorkerHandler(creep);
        workerHandler(creep);
    });
    if (Game.time % 10 === 0) {
        const myRooms = Object.values(Game.rooms).filter(room => room.controller?.my);
        myRooms.forEach(room => {
            handleRoomSpawning(room);
        });
    }

    // clean ups 
    if (Game.time % 50 === 0) {
        clearDeadCreepMemory();
    }
    console.log(`Tick: ${Game.time}`);
}