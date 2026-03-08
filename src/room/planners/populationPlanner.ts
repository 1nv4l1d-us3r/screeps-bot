
import { findCenterCoord, getCoordDistance } from "../../geometry";
import { WorkerRoles } from "types/roles";
import { Worker } from "types/worker";


import { getMaxBuildableStructuresByLevel } from "../../utils/gameConstants";


import { Coord } from "../../types/geometry";
import { BaseConfig, MiningSiteConfig } from "../../types/room/planner";
import { PopulationConfig, WorkerSpawnConfig } from "../../types/room/planner";





export class PopulationPlanner {


    public static getPopulationConfigForRoom = (room: Room,miningConfig: MiningSiteConfig[]) => {


        const miningWorkerConfigs = this.getMinersSpawnConfigs(room,miningConfig);

        const populationConfig: PopulationConfig = {
            totalWorkers: miningWorkerConfigs.length,
            workerSpawnConfigs: miningWorkerConfigs
        }
        return populationConfig;

    }

    private static getMinersSpawnConfigs = (room: Room,miningConfig: MiningSiteConfig[]) => {
    
        const minerOptimalBodyParts=[WORK,WORK,MOVE];
      
        const miningWorkerConfigs: WorkerSpawnConfig[] = [];
        const roomSpawnBudget = room.energyCapacityAvailable;
      
        miningConfig.forEach(miningSite => {

            let minerBodyParts: BodyPartConstant[]=[MOVE];
            if(miningSite.storageType===STRUCTURE_LINK) {
                minerBodyParts.push(CARRY);
                // add storage if using link storage
            }
            const spentBudget=this.getBodyPartsCost(minerBodyParts);
            const remainingBudget=roomSpawnBudget-spentBudget;
            const maxWorkParts=5; // max work part to match energy production rate
            const autoScaledBodyParts=this.getAutoScaledBodyParts([WORK],remainingBudget,maxWorkParts);
            minerBodyParts.push(...autoScaledBodyParts);

            const minerId = `M-${room.name}-${miningSite.resourceId}` as Id<Worker>;
            const minerMemory = {
                role: WorkerRoles.MINER,
                ...miningSite,

            }
            const minerWorkerConfig: WorkerSpawnConfig = {
                workerId: minerId,
                bodyParts: minerBodyParts,
                optimalBodyParts: minerOptimalBodyParts,
                memory: minerMemory
            }
            miningWorkerConfigs.push(minerWorkerConfig);

            // if(miningSite.storageType!==STRUCTURE_LINK) {

            //     const haulerId = `H-${room.name}-${miningSite.resourceId}` as Id<Worker>;
            //     const haulerMemory: WorkerMemory = {
            //         role: WorkerRoles.HAULER,
            //         workerId: haulerId,
            //         ...miningSite,
            //     }
            //     const haulerWorkerConfig: WorkerSpawnConfig = {
            //         workerId: haulerId,
            //         bodyParts: haulerBodyParts,
            //         optimalBodyParts: haulerOptimalBodyParts,

            // }

        });


        return miningWorkerConfigs;
    
        
    
    
    }


    

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




// export const getRoomPopulation = (room: Room) => {

//     const roomWorkerSpawnConfigs: WorkerSpawnConfig[] = [];

//         // using a record to store the worker configs for each worker role.
//         // makes sure all the worker roles are accounted for.
//     const roomWorkerConfigs:Record<WorkerRoles, WorkerSpawnConfig[]>={
//         [WorkerRoles.HARVESTER]: getHarvestersSpawnDetails(room),
//         [WorkerRoles.UPGRADER]: getUpgradersSpawnDetails(room),
//         [WorkerRoles.BUILDER]: getBuildersSpawnDetails(room),
//         [WorkerRoles.MINER]: getMinersSpawnDetails(room),
//     }

//     for(const workerRole of Object.values(WorkerRoles)) {
//         const workerSpawnConfigs = roomWorkerConfigs[workerRole];
//         roomWorkerSpawnConfigs.push(...workerSpawnConfigs);
//     }
//     const roomPopulation: RoomPopulation = {
//         totalWorkers: roomWorkerSpawnConfigs.length,
//         workerSpawnConfigs: roomWorkerSpawnConfigs
//     }
//     return roomPopulation;
// }

// type WorkerMemoryWithoutId = Omit<WorkerMemory, 'workerId'>;
/*
generic function to get the spawn configuration for a simple worker.
creates a array of worker configs for the given number of workers.
*/
// interface GetSimpleWorkerSpawnDetailsParams {
//     room:Room
//     bodyParts: BodyPartConstant[]
//     optimalBodyParts: BodyPartConstant[]
//     memory: WorkerMemoryWithoutId
//     workerCount: number
// }

// const getSimpleWorkerSpawnConfig=(params: GetSimpleWorkerSpawnDetailsParams) => {

//     const {room,bodyParts,optimalBodyParts,memory,workerCount} = params;
//     return Array(workerCount).fill(0).map((_,index)=>{
//         const workerId = `${memory.role}-${room.name}-${index}` as Id<Worker>;
//         return {
//             workerId: workerId,
//             bodyParts: bodyParts,
//             optimalBodyParts: optimalBodyParts,
//             memory: {
//                 ...memory,
//                 workerId: workerId
//             }
//         }
//     });
// }



// /*
// Get the spawn configuration for the harvesters in the room.
// replicate the same body parts for all the harvesters.
// */
// const getHarvestersSpawnDetails = (room: Room) => {
//     const roomLevel = room.controller?.level || 0;
//     const harvesterCount = roomLevel == 1 ? 6 : 4;
//     const roomSpawnBudget = room.energyCapacityAvailable;
//     const harvesterOptimalBodyParts=[WORK,CARRY,MOVE,MOVE];
//     const harvesterAutoScaleBodyParts=[WORK,CARRY,MOVE,MOVE];
//     const harvesterBody=roomLevel==1 ?harvesterOptimalBodyParts:getAutoScaledBodyParts(harvesterAutoScaleBodyParts,roomSpawnBudget,15);
//     const harvesterSpawnDetails = getSimpleWorkerSpawnConfig({
//         room,
//         bodyParts: harvesterBody,
//         optimalBodyParts: harvesterOptimalBodyParts,
//         memory: {
//             role: WorkerRoles.HARVESTER
//         },
//         workerCount: harvesterCount
//     });
//     return harvesterSpawnDetails;
// }



// const getUpgradersSpawnDetails = (room: Room) => {
//     const roomLevel = room.controller?.level || 0;
//     let upgraderCount = roomLevel == 1 ? 1 : Math.min(1,roomLevel);
//     const roomSpawnBudget = room.energyCapacityAvailable;
//     const upgraderOptimalBodyParts=[WORK,CARRY,MOVE,MOVE];
//     const upgraderAutoScaleBodyParts=[WORK,CARRY,MOVE,MOVE];
//     const upgraderBody=roomLevel==1 ?upgraderOptimalBodyParts:getAutoScaledBodyParts(upgraderAutoScaleBodyParts,roomSpawnBudget,15);
//     const upgraderSpawnDetails = getSimpleWorkerSpawnConfig({
//         room,
//         bodyParts: upgraderBody,
//         optimalBodyParts: upgraderOptimalBodyParts,
//         memory: {
//             role: WorkerRoles.UPGRADER
//         },
//         workerCount: upgraderCount
//     });
//     return upgraderSpawnDetails;
// }




// const getBuildersSpawnDetails = (room: Room) => {
//     const roomLevel = room.controller?.level || 0;
//     let builderCount = roomLevel == 1 ? 1 : Math.min(1,roomLevel);
//     const roomSpawnBudget = room.energyCapacityAvailable;
//     const builderOptimalBodyParts=[WORK,CARRY,MOVE,MOVE];
//     const builderAutoScaleBodyParts=[WORK,CARRY,MOVE,MOVE];
//     const builderBody=roomLevel==1 ?builderOptimalBodyParts:getAutoScaledBodyParts(builderAutoScaleBodyParts,roomSpawnBudget,15);
//     const builderSpawnDetails = getSimpleWorkerSpawnConfig({
//         room,
//         bodyParts: builderBody,
//         optimalBodyParts: builderOptimalBodyParts,
//         memory: {
//             role: WorkerRoles.BUILDER
//         },
//         workerCount: builderCount
//     });
//     return builderSpawnDetails;
// }






/*
Get the number of work parts required to mine the source.
based on the source energy capacity and the energy regeneration rate.
*/
// const getWorkPartsRequiredForSourceMining = (source: Source) => {
//     const sourceEnergyCapacity=source.energyCapacity;
//     const energyRegenTime=300; // 300 ticks per energy generation
//     const regenRate= Math.ceil(sourceEnergyCapacity/energyRegenTime);
//     return Math.ceil(regenRate/HARVEST_POWER);
// }