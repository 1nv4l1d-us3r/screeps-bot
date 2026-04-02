import { CommonFunctions } from "utils/commonFunctions";
import { RoomPlanner } from "room/planners/roomPlanner";

import { Scheduler } from "helpers/Scheduler";


export class SpawnManager {


    public static startDeamon(){

        Scheduler.createRecurringJob({
            name: 'SpawnManagerDeamon',
            interval: 20,
            func: SpawnManager.startRoomPopulationJobs,
        })

    }

    private static startRoomPopulationJobs(){
        const myRooms=CommonFunctions.getMyRooms();
        Scheduler.createOneTimeJobs({
            list: myRooms,
            nameGenerator: (room) => 'PopulationCheck-' + room.name,
            delay:1,
            offset:2,
            func: (room) => SpawnManager.populateSpawnQueue(room),
        })
    }



    private static populateSpawnQueue(room: Room) {
        let roomPlan=room.memory.roomPlan;
        if(!roomPlan) {
            roomPlan=RoomPlanner.getRoomPlan(room);
            room.memory.roomPlan=roomPlan;
        }
        
        const populationConfig=roomPlan.populationConfig;
        let spawningOperation=room.memory.spawning;
        if(!spawningOperation) {
            spawningOperation={
                spawnQueue:[],
            }
        }
       console.log(`Populating spawn queue for room ${room.name}`);
        
        const roomWorkers=CommonFunctions.getRoomWorkers(room);

        const aliveWorkerCount=roomWorkers.length;

        const needWorkerReconciliation=aliveWorkerCount<populationConfig.totalWorkers
        const spawningLocked=spawningOperation.lockedUntil>Game.time;

        if(needWorkerReconciliation && !spawningLocked) {
            const aliveWorkerIds=new Set(roomWorkers.map(worker => worker.name));
            const toBeSpawnedWorkerConfigs=populationConfig.workerSpawnConfigs.filter(spawnConfig => !aliveWorkerIds.has(spawnConfig.workerId));
            spawningOperation.spawnQueue=toBeSpawnedWorkerConfigs;

        }  
        room.memory.spawning=spawningOperation;

        const queueIsEmpty=spawningOperation.spawnQueue.length===0;
        // const lockEpiryDelay=100; // 100 ticks
        const isLockExpired=!spawningOperation.lockedUntil?true:(spawningOperation.lockedUntil)<=Game.time;


        if(!queueIsEmpty && isLockExpired) {
            Scheduler.createOneTimeJob({
                name: 'ProcessSpawnQueue-' + room.name,
                delay: 1,
                func: () => this.processSpawnQueue(room),
            })
        }
    }


    private static processSpawnQueue(room: Room) {
        const roomPlan=room.memory.roomPlan;
        let spawningOperation=room.memory.spawning;
        if(!roomPlan || !spawningOperation) {
            this.populateSpawnQueue(room);
            spawningOperation=room.memory.spawning;
            if(!roomPlan || !spawningOperation) {
                console.log(`Spawn queue not found for room ${room.name} even after populating it`);
                return;
            }
        }
        const spawnQueue=spawningOperation.spawnQueue;
        if(!spawnQueue.length) {
            return;
        }
        
        const roomSpawns=room.find(FIND_MY_SPAWNS)
        const freeSpawns=roomSpawns.filter(spawn => spawn.spawning === null);
        let nextSpawnDelay:number|null=null;
        
        if(!freeSpawns.length) {
            nextSpawnDelay=roomSpawns.reduce((minTime, spawn) => {
                return Math.min(minTime, spawn.spawning?.remainingTime || 0) + 1;
            }, 300);
        }
        else{
            const populationConfig=roomPlan.populationConfig;

            const aliveWorkers=CommonFunctions.getRoomWorkers(room);
            const aliveWorkerCount=aliveWorkers.length;
            const isWorkerCountBelowCritical=aliveWorkerCount<populationConfig.criticalWorkers;
            
            const energyAvailable=room.energyAvailable;
            const optimalEnergy=Math.ceil(room.energyCapacityAvailable/3);
            const isRoomEnergyBelowOptimal=energyAvailable<500 || energyAvailable<optimalEnergy;
            const isRoomStruggling=isWorkerCountBelowCritical && isRoomEnergyBelowOptimal;
            while(spawnQueue.length && freeSpawns.length) {
                const spawn=freeSpawns.shift();
                if(!spawn) {
                    break;
                }
                const spawnConfig=spawnQueue[0];
                if(!spawnConfig) {
                    break;
                }
                const workerName=spawnConfig.workerId;
                const workerMemory=spawnConfig.roleMemory;
                const workerBodyParts=isRoomStruggling?spawnConfig.optimalBodyParts:spawnConfig.bodyParts;
                if(isRoomStruggling) {
                    console.log('Room is struggling, spawning optimal worker',workerName);
                }
                const spawnResult=spawn.spawnCreep(workerBodyParts, workerName, {memory: {roleMemory: workerMemory}});
                if(spawnResult === OK) {
                    spawnQueue.shift();
                }
                else{
                    break;
                }
            }
        }

        if(nextSpawnDelay) {
            // lock the spawning for the next spawn delay and reSchedule the job
            spawningOperation.lockedUntil=Game.time+nextSpawnDelay;
            // Scheduler.createOneTimeJob({
            //     name: 'ProcessSpawnQueueAfterDelay-' + room.name,
            //     delay: nextSpawnDelay,
            //     func: () => this.processSpawnQueue(room),
            // })
        }

    
    }

}