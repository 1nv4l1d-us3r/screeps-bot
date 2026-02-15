
import { CreepRoles } from "./roles/base";
import { WorkerCreep, getWorkerHandler } from "./roles";
import { handleRoomSpawning } from "./spawning/RoomSpawning";
import { clearDeadCreepMemory } from "./cleanup";


export const loop = () => {

    const myCreeps: WorkerCreep[] = Object.values(Game.creeps).filter(creep => creep.my) as WorkerCreep[];
    myCreeps.forEach(creep => {
        const workerRole=creep.memory.role;
        const workerHandler = getWorkerHandler(creep);
        creep.say(`${creep.memory.role}`);
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