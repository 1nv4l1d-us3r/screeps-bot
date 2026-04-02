import {  BuilderMemory, RoleMemory, WorkerRoles } from "types/roles";
import { Worker,WorkerMemory } from "../../types/worker";


import { BaseConfig, MiningSiteConfig } from "../../types/room/planner";
import { PopulationConfig, WorkerSpawnConfig } from "../../types/room/planner";
import { MinerMemory, MineHaulerMemory } from "types/roles";





export class PopulationPlanner {


    private static commonWorkerBodyParts=[WORK,CARRY,MOVE,MOVE];
    private static commonWorkerMaxParts=16;


    public static getPopulationConfigForRoom = (room: Room,miningConfig: MiningSiteConfig[]) => {


        const miningWorkerSpawnConfigs = this.getMiningWorkerSpawnConfigs(room,miningConfig);
        const fillerSpawnConfigs = this.getFillerSpawnConfigs(room);
        const repairerSpawnConfigs = this.getRepairerSpawnConfigs(room);
        const builderSpawnConfigs = this.getBuilderSpawnConfigs(room);
        const upgraderSpawnConfigs = this.getUpgraderSpawnConfigs(room);
        const recyclerSpawnConfigs = this.getRecyclerSpawnConfigs(room);


        const workerSpawnConfigs:WorkerSpawnConfig[] =miningWorkerSpawnConfigs
            .concat(fillerSpawnConfigs)
            .concat(repairerSpawnConfigs)
            .concat(builderSpawnConfigs)
            .concat(upgraderSpawnConfigs)
            .concat(recyclerSpawnConfigs)


        const criticalWorkers=workerSpawnConfigs.filter(spawnConfig => spawnConfig.isCriticalWorker)

        const populationConfig: PopulationConfig = {
            totalWorkers: workerSpawnConfigs.length,
            criticalWorkers: criticalWorkers.length,
            workerSpawnConfigs: workerSpawnConfigs,
        }
        return populationConfig;

    }




    private static getMiningWorkerSpawnConfigs = (room: Room,miningConfig: MiningSiteConfig[]) => {

        const roomLevel = room.controller?.level || 0;

        const haulerCount=roomLevel<3?2:1;

      
        const mineWorkerSpawnConfigs: WorkerSpawnConfig[] = [];
        const roomSpawnBudget = room.energyCapacityAvailable;
      
        miningConfig.forEach(miningSite => {
            let minerOptimalBodyParts: BodyPartConstant[]=[WORK,MOVE];

            let minerBodyParts: BodyPartConstant[]=[MOVE];
            if(miningSite.storageType===STRUCTURE_LINK) {
                minerBodyParts.push(CARRY);
                minerOptimalBodyParts.push(CARRY);
                // add storage if using link storage
            }
            const spentBudget=this.getBodyPartsCost(minerBodyParts);
            const remainingBudget=roomSpawnBudget-spentBudget;
            const maxWorkParts=5; // max work part to match energy production rate
            const autoScaledBodyParts=this.getAutoScaledBodyParts([WORK],remainingBudget,maxWorkParts);
            minerBodyParts.push(...autoScaledBodyParts);

            const minerId = `M-${room.name}-${miningSite.resourceId}` as Id<Worker>;
            const minerRoleMemory: RoleMemory<WorkerRoles.MINER> = {
                role: WorkerRoles.MINER,
                resourceId: miningSite.resourceId,
                resourceType: miningSite.resourceType,
                miningCoord: miningSite.miningCoord,
                storageType: miningSite.storageType,
                storageCoord: miningSite.storageCoord,

            }
            const minerSpawnConfig: WorkerSpawnConfig = {
                workerId: minerId,
                isCriticalWorker: true,
                bodyParts: minerBodyParts,
                optimalBodyParts: minerOptimalBodyParts,
                roleMemory: minerRoleMemory,
            }
            mineWorkerSpawnConfigs.push(minerSpawnConfig);

            if(miningSite.storageType!==STRUCTURE_LINK) {

                const haulerOptimalBodyParts=[MOVE,CARRY];
                const haulerMaxBodyParts=14;
                const haulerBodyParts=this.getAutoScaledBodyParts(haulerOptimalBodyParts,roomSpawnBudget,haulerMaxBodyParts);


                for(let haunerIndex=0; haunerIndex<haulerCount; haunerIndex++) {
                    const mineHaulerId = `M-H-${room.name}-${miningSite.resourceId}-${haunerIndex}` as Id<Worker>;
                    const mineHaulerRoleMemory: RoleMemory<WorkerRoles.HAULER> = {
                        role: WorkerRoles.HAULER,
                        resourceType: miningSite.resourceType,
                        miningCoord: miningSite.miningCoord,
                        storageCoord: miningSite.storageCoord,
                    }
                    const mineHaulerSpawnConfig: WorkerSpawnConfig = {
                        workerId: mineHaulerId,
                        isCriticalWorker: true,
                        bodyParts: haulerBodyParts,
                        optimalBodyParts: haulerOptimalBodyParts,
                        roleMemory: mineHaulerRoleMemory,
                    }
                    mineWorkerSpawnConfigs.push(mineHaulerSpawnConfig);
                }

            }
            

        });


        return mineWorkerSpawnConfigs;
    }


    private static getFillerSpawnConfigs = (room: Room) => {
        const roomLevel = room.controller?.level || 0;
        
        let fillerCount: number;

        if(roomLevel === 1) 
            return [];
        else if(roomLevel >=2 && roomLevel < 5)
            fillerCount = 1;
        else if(roomLevel >= 5)
            fillerCount = 2;

        const fillerOptimalBodyParts=[CARRY,MOVE];
        const fillerMaxBodyParts=20;
        const fillerBodyParts=this.getAutoScaledBodyParts(fillerOptimalBodyParts,room.energyCapacityAvailable,fillerMaxBodyParts);
        const fillerSpawnConfigs: WorkerSpawnConfig[] = [];

        for(let i = 0; i < fillerCount; i++) {
            const fillerId = `F-${room.name}-${i}` as Id<Worker>;

            const fillerRoleMemory: RoleMemory<WorkerRoles.FILLER> = {
                role: WorkerRoles.FILLER,
            }
            const fillerSpawnConfig: WorkerSpawnConfig = {
                workerId: fillerId,
                isCriticalWorker: true,
                bodyParts: fillerBodyParts,
                optimalBodyParts: fillerOptimalBodyParts,
                roleMemory: fillerRoleMemory,
            }
            fillerSpawnConfigs.push(fillerSpawnConfig);
        }
        return fillerSpawnConfigs;
    }


    
    private static getBuilderSpawnConfigs = (room: Room) => {
        const roomLevel = room.controller?.level || 0;
        let builderCount=roomLevel<3?2:1;
        const autoScaledBodyParts=this.getAutoScaledBodyParts(PopulationPlanner.commonWorkerBodyParts,room.energyCapacityAvailable,PopulationPlanner.commonWorkerMaxParts);
        
        const builderSpawnConfigs: WorkerSpawnConfig[] = [];
        for(let i = 0; i < builderCount; i++) {
            const builderId = `B-${room.name}-${i}` as Id<Worker>;
            const builderRoleMemory: RoleMemory<WorkerRoles.BUILDER> = {
                role: WorkerRoles.BUILDER,
            }
            const builderSpawnConfig: WorkerSpawnConfig = {
                workerId: builderId,
                bodyParts: autoScaledBodyParts,
                optimalBodyParts: PopulationPlanner.commonWorkerBodyParts,
                roleMemory: builderRoleMemory,
            }
            builderSpawnConfigs.push(builderSpawnConfig);
        }
        return builderSpawnConfigs;
    }


    private static getRepairerSpawnConfigs = (room: Room) => {
        const roomLevel = room.controller?.level || 0;
        let repairerCount:number;
        if(roomLevel < 3){
            return [];
        }
        else {
            repairerCount = 1;
            // add more if required
        }
        const commonWorkerBodyParts=[WORK,CARRY,MOVE,MOVE];
        const commonWorkerMaxParts=16;
        const autoScaledBodyParts=this.getAutoScaledBodyParts(commonWorkerBodyParts,room.energyCapacityAvailable,commonWorkerMaxParts);
        const repairerSpawnConfigs: WorkerSpawnConfig[] = [];
        for(let i = 0; i < repairerCount; i++) {
            const repairerId = `R-${room.name}-${i}` as Id<Worker>;
            const repairerRoleMemory: RoleMemory<WorkerRoles.REPAIRER> = {
                role: WorkerRoles.REPAIRER,
            }
            const repairerSpawnConfig: WorkerSpawnConfig = {
                workerId: repairerId,
                bodyParts: autoScaledBodyParts,
                optimalBodyParts: commonWorkerBodyParts,
                roleMemory: repairerRoleMemory,
            }
            repairerSpawnConfigs.push(repairerSpawnConfig);
        }
        return repairerSpawnConfigs;
    }

    private static getUpgraderSpawnConfigs = (room: Room) => {
        const roomLevel = room.controller?.level || 0;
        let upgraderCount=roomLevel<3?2:1;
        const autoScaledBodyParts=this.getAutoScaledBodyParts(PopulationPlanner.commonWorkerBodyParts,room.energyCapacityAvailable,PopulationPlanner.commonWorkerMaxParts);
        const upgraderSpawnConfigs: WorkerSpawnConfig[] = [];
        for(let i = 0; i < upgraderCount; i++) {
            const upgraderId = `U-${room.name}-${i}` as Id<Worker>;
            const upgraderRoleMemory: RoleMemory<WorkerRoles.UPGRADER> = {
                role: WorkerRoles.UPGRADER,
            }
            const upgraderSpawnConfig: WorkerSpawnConfig = {
                workerId: upgraderId,
                bodyParts: autoScaledBodyParts,
                optimalBodyParts: PopulationPlanner.commonWorkerBodyParts,
                roleMemory: upgraderRoleMemory,
            }
            upgraderSpawnConfigs.push(upgraderSpawnConfig);
        }
        return upgraderSpawnConfigs;
    }



    private static getRecyclerSpawnConfigs = (room: Room) => {
        
        const roomRuins = room.find(FIND_RUINS);

        const valuableRuins = roomRuins.filter(ruin => {
            if(!ruin.store) {
                return false;
            }
            const hasEnergy = ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 10000;
            const isLasting = ruin.ticksToDecay > 1000;
            return hasEnergy && isLasting;
        });
        if(valuableRuins.length === 0) {
            return [];
        }

        const recyclerBodyParts=[CARRY,MOVE];
        const recyclerMaxBodyParts=20;
        const autoScaledBodyParts=this.getAutoScaledBodyParts(recyclerBodyParts,room.energyCapacityAvailable,recyclerMaxBodyParts);

        const recyclerId = `RCY-${room.name}` as Id<Worker>;
        const recyclerRoleMemory: RoleMemory<WorkerRoles.RECYCLER> = {
            role: WorkerRoles.RECYCLER,
        }
        const recyclerSpawnConfig: WorkerSpawnConfig = {
            workerId: recyclerId,
            bodyParts: autoScaledBodyParts,
            optimalBodyParts: recyclerBodyParts,
            roleMemory: recyclerRoleMemory,
        }
        return [recyclerSpawnConfig];
    }



    //---------------- Utility Functions ----------------//
    private static getBodyPartsCost=(bodyPart: BodyPartConstant | BodyPartConstant[])=> {
        if(Array.isArray(bodyPart)) {
            return bodyPart.reduce((acc, part) => acc + BODYPART_COST[part], 0);
        }
        return BODYPART_COST[bodyPart];
    }




    private static getAutoScaledBodyParts = (bodyParts: BodyPartConstant[],budget: number,maxBodyParts: number = 50) => {

        const bodyPartsSetCost = this.getBodyPartsCost(bodyParts);


        const affordableSetCount = Math.floor(budget / bodyPartsSetCost);

        let bodyArray: BodyPartConstant[]=[];

        if(affordableSetCount <=1) {
            bodyArray = bodyParts
            return bodyArray;
        }

        for(let i = 0; i < affordableSetCount && bodyArray.length < maxBodyParts; i++) {
            bodyArray.push(...bodyParts);
        }
        return bodyArray;
    }




    
}



