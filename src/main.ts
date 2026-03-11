import { Cleanup } from "./helpers/cleanup";
import { RoleHandler } from "./roles/roleHander";
import { TaskHandler } from "tasks/taskHandler";

import { handleIntrusionDetection } from "./roomDefence/intrusionDetection";
import { handleRoomTowerDefence } from "./roomDefence/towerDefence";

import { Scheduler } from "./helpers/Scheduler";
import { CpuProfiler } from "./helpers/cpuProfiler";
import { testScriptRunner } from "./helpers/testScriptRunner";

import { RoomPlanner } from "./room/planners/roomPlanner";
import { SpawnManager } from "./room/managers/spawnManager";
import { ConstructionManager } from "./room/operations/construction/constructionManager";
import { LogisticsManager } from "room/managers/logisticsmanager";



// const startRecurringJobs=()=>{

Cleanup.startDeamon();
RoomPlanner.startDeamon();
SpawnManager.startDeamon();
ConstructionManager.startDeamon();
LogisticsManager.startDeamon();

export const loop = () => {
    if(Memory.logCpuUsage) {
        CpuProfiler.log("Main Loop");
    }
    Scheduler.run();
    console.log('Tick ' + Game.time);
    



    // ------------ Worker Task Handling ------------//
  
    const myWorkers = Object.values(Game.creeps).filter(worker => worker.my);
    myWorkers.forEach(worker => {
        const memory = worker.memory

        if(memory.task) {
            TaskHandler.handleTask(worker as any);
            return;
            
        }


        RoleHandler.handleRole(worker as any);
    });



    // ------------ Room Task  Handling ------------//
    const myRooms = Object.values(Game.rooms).filter(room => room.controller?.my);




    // ------------ Room  Defence ------------//
    myRooms.forEach(room => {
        if(room.memory.hasHostileCreeps) {
            handleRoomTowerDefence(room);
        }
    });
    

    // // ------------ Construct Structures ------------//

    // Scheduler.registerIntervalList({
    //     list: myRooms,
    //     nameGenerator: (room) => 'constructStructures-' + room.name,
    //     interval: 100,
    //     callback: (room) => {
    //         constructStructuresInRoom(room);
    //     }
    // })

    


    // // ------------ Intrusion Detection ------------//
    // Scheduler.registerIntervalList({
    //     list: myRooms,
    //     nameGenerator: (room) => 'intrusionDetection-' + room.name,
    //     interval: 10,
    //     callback: (room) => {
    //         handleIntrusionDetection(room);
    //     }
    // });
    

  

   
    

   


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


