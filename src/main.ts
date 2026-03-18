import { Cleanup } from "./helpers/cleanup";
import { RoleHandler } from "./roles/roleHander";
import { TaskHandler } from "tasks/taskHandler";


import { Scheduler } from "./helpers/Scheduler";
import { CpuProfiler } from "./helpers/cpuProfiler";
import { testScriptRunner } from "./helpers/testScriptRunner";

import { RoomPlanner } from "./room/planners/roomPlanner";
import { SpawnManager } from "./room/managers/spawnManager";
import { ConstructionManager } from "./room/managers/constructionManager";
import { LogisticsManager } from "room/managers/logisticsManager";
import { DefenceManager } from "room/managers/defenceManager";


// const startRecurringJobs=()=>{

Cleanup.startDeamon();
RoomPlanner.startDeamon();
SpawnManager.startDeamon();
ConstructionManager.startDeamon();
LogisticsManager.startDeamon();
DefenceManager.startDeamon();

export const loop = () => {
    if(Memory.logCpuUsage) {
        CpuProfiler.log("Main Loop");
    }
    Scheduler.run();
    DefenceManager.handleDefence();
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


