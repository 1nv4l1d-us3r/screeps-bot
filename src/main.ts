
import { getWorkerHandler } from "./roles";
import { handleWorkerSpawning } from "./spawning/RoomSpawning";
import { clearDeadCreepMemory } from "./helpers/cleanup";

import { collectEnergy } from "./actions/energyCollection";
import { mineResource } from "./actions/resourceMining";
import { handleIntrusionDetection } from "./roomDefence/intrusionDetection";
import { handleRoomTowerDefence } from "./roomDefence/towerDefence";
import { constructStructuresInRoom } from "./roomDesign/constructStructures";

import { testScriptRunner } from "./helpers/testScriptRunner";
import { initializeOverrides } from "./overrides";
import { updateWorkerPopulation } from "./spawning/RoomPopulation";
import { CpuProfiler } from "./helpers/cpuProfiler";

// Initialize prototype overrides once at module load
initializeOverrides();

export const loop = () => {
    if(Memory.logCpuUsage) {
        CpuProfiler.log("Main Loop");
    }



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

    if (Game.time % 10 === 0) {
        handleWorkerSpawning();
    }

    if (Game.time % 100 === 0) {
        myRooms.forEach(room => {
            constructStructuresInRoom(room);
        });
    }
    if(Game.time % 100 === 0) {
        updateWorkerPopulation(myRooms);
    }

    // ------------ Clean Ups ------------//
    if (Game.time % 100 === 0) {
        clearDeadCreepMemory();
    }


    // ------------ Test Script / Debugging ------------//
    if(Memory.testScript) {
        testScriptRunner();
        delete Memory.testScript;
    }

    if(Memory.logCpuUsage) {
        CpuProfiler.logEnd("Main Loop");
    }
}