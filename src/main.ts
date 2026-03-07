
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
import { RoomPlanner } from "./room/planners/roomPlanner";
import { CpuProfiler } from "./helpers/cpuProfiler";
import { Scheduler } from "./helpers/Scheduler";





// const startRecurringJobs=()=>{

RoomPlanner.startDeamon();

export const loop = () => {
    if(Memory.logCpuUsage) {
        CpuProfiler.log("Main Loop");
    }
    Scheduler.run();
    



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




    // ------------ Room  Defence ------------//
    myRooms.forEach(room => {
        if(room.memory.hasHostileCreeps) {
            handleRoomTowerDefence(room);
        }
    });
    

    // ------------ Construct Structures ------------//

    Scheduler.registerIntervalList({
        list: myRooms,
        nameGenerator: (room) => 'constructStructures-' + room.name,
        interval: 100,
        callback: (room) => {
            constructStructuresInRoom(room);
        }
    })

    


    // ------------ Intrusion Detection ------------//
    Scheduler.registerIntervalList({
        list: myRooms,
        nameGenerator: (room) => 'intrusionDetection-' + room.name,
        interval: 10,
        callback: (room) => {
            handleIntrusionDetection(room);
        }
    });
    

    // ------------ Worker Spawning ------------//
    Scheduler.registerInterval({
        intervalName: 'workerSpawning',
        interval: 10,
        callback:handleWorkerSpawning
    })

   
    // ------------ Worker Population Update ------------//
    Scheduler.registerInterval({
        intervalName: 'workerPopulationUpdate',
        interval: 100,
        callback: () => {
            updateWorkerPopulation(myRooms);
        }
    })

    // ------------ Clean Ups ------------//
    Scheduler.registerInterval({
        intervalName: 'creepMemoryCleanup',
        interval: 100,
        callback: clearDeadCreepMemory
    })


    // ------------ Test Script / Debugging ------------//
    if(Memory.testScript) {
        testScriptRunner();
        delete Memory.testScript;
    }

    // 
    if(Game.cpu.bucket==10000) {
        Game.cpu.generatePixel();
    }

    if(Memory.logCpuUsage) {
        CpuProfiler.logEnd("Main Loop");
    }
}

