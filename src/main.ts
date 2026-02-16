
import { getWorkerHandler } from "./roles";
import { handleRoomSpawning } from "./spawning/RoomSpawning";
import { clearDeadCreepMemory } from "./cleanup";

import { collectEnergy } from "./actions/energyCollection";
import { mineResource } from "./actions/resourceMining";
import { handleIntrusionDetection } from "./roomDefence/intrusionDetection";
import { handleRoomTowerDefence } from "./roomDefence/towerDefence";
import { constructStructuresInRoom } from "./roomDesign/constructStructures";

import { testScript } from "./testScript";

export const loop = () => {

    const myCreeps = Object.values(Game.creeps).filter(creep => creep.my);
    myCreeps.forEach(creep => {
        if (creep.memory.isCollectingEnergy) {
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

    const myRooms = Object.values(Game.rooms).filter(room => room.controller?.my);

    for(const room of myRooms) {
        if(room.memory.hostileCreepsPresent) {
            handleRoomTowerDefence(room);
        }
    }

    if(Memory.testScript) {
        testScript();
        delete Memory.testScript;
    }


    if (Game.time % 10 === 0) {
        myRooms.forEach(room => {
            handleRoomSpawning(room);
        });
    }

    if (Game.time % 5 === 0) {
        myRooms.forEach(room => {
            handleIntrusionDetection(room);
        });
    }

    if (Game.time % 20 === 0) {
        myRooms.forEach(room => {
            constructStructuresInRoom(room);
        });
    }

    // clean ups 
    if (Game.time % 50 === 0) {
        clearDeadCreepMemory();
    }
    console.log(`Tick: ${Game.time}`);
}