
import { getWorkerHandler } from "./roles";
import { handleWorkerSpawning } from "./spawning/RoomSpawning";
import { clearDeadCreepMemory } from "./cleanup";

import { collectEnergy } from "./actions/energyCollection";
import { mineResource } from "./actions/resourceMining";
import { handleIntrusionDetection } from "./roomDefence/intrusionDetection";
import { handleRoomTowerDefence } from "./roomDefence/towerDefence";
import { constructStructuresInRoom } from "./roomDesign/constructStructures";

import { testScript } from "./testScript";
import { initializeOverrides } from "./overrides";

// Initialize prototype overrides once at module load
initializeOverrides();

export const loop = () => {
    const cpuUsageTickStart = Game.cpu.getUsed();



    // ------------ Worker Task Handling ------------//
  
    const myWorkers = Object.values(Game.creeps).filter(worker => worker.my);
    myWorkers.forEach(worker => {
        if (worker.memory.isCollectingEnergy) {
            collectEnergy(worker);
            return;
        }
        if (worker.memory.isMiningResource) {
            mineResource(worker);
            return;
        }

        const workerHandler = getWorkerHandler(worker);
        workerHandler(worker);
    });



    // ------------ Room Task  Handling ------------//
    const myRooms = Object.values(Game.rooms).filter(room => room.controller?.my);


    myRooms.forEach(room => {
        if(room.memory.hasHostileCreeps) {
            handleRoomTowerDefence(room);
        }
    });

    if (Game.time % 5 === 0) {
        myRooms.forEach(room => {
            handleIntrusionDetection(room);
        });
    }

    // if (Game.time % 10 === 0) {
    //     handleWorkerSpawning();
    // }

    if (Game.time % 50 === 0) {
        myRooms.forEach(room => {
            constructStructuresInRoom(room);
        });
    }

    // ------------ Clean Ups ------------//
    if (Game.time % 50 === 0) {
        clearDeadCreepMemory();
    }


    // ------------ Test Script / Debugging ------------//
    if(Memory.testScript) {
        testScript();
        delete Memory.testScript;
    }

    const cpuUsageTickEnd = Game.cpu.getUsed();
    console.log(`Tick: ${Game.time} CPU Usage: ${cpuUsageTickEnd - cpuUsageTickStart}`);
}