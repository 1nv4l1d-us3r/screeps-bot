import { Worker } from "types/worker";
import { WorkerRoles } from "types/roles";
import { RepairableStructure, RepairTask, TasksType, WithdrawResourceTask } from "types/tasks";

import { TickCache } from "helpers/cache";

import { builderRole } from "./builder";

type BuilderWorker = Worker<WorkerRoles.BUILDER>;
type RepairerWorker = Worker<WorkerRoles.REPAIRER>;

export class Repairer {

    private static WALL_REPAIR_HITS = 5000;
    private static CONTAINER_REPAIR_THRESHOLD = 0.8;
    private static CONTAINER_MAX_HITS = 250000;




    public static handleRepairerRole(worker: RepairerWorker) {


        const repairTasks = Repairer.findRepairTaskData(worker.room);
        if(!repairTasks){
            builderRole(worker as unknown as BuilderWorker);
            return;
        }
        
        if(worker.store.getUsedCapacity()>0) {
            worker.memory.task = repairTasks;
            return;
        }
        else {
            const withdrawEnergyTask: WithdrawResourceTask = {
                taskType: TasksType.WITHDRAW_RESOURCE,
                data: {
                    withdrawStructureId: 'auto',
                    resourceType: RESOURCE_ENERGY,
                }
            }
            worker.memory.task = withdrawEnergyTask;
            return;
        }
    }





    @TickCache((room: Room) => room.name)
    private static findRepairTaskData(room: Room) {
        const roomStructures=room.find(FIND_STRUCTURES);
        const repairWallsAndRamparts:(StructureWall|StructureRampart)[] = [];
        const repairContainers:StructureContainer[] = [];
        const otherStructures:RepairableStructure[] = [];

        for(const structure of roomStructures) {
            const structureHits = structure.hits;
            const structureMaxHits = structure.hitsMax;
            if(structureHits==structureMaxHits){
                continue;
            }
            if(structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART){

                if(structureHits < Repairer.WALL_REPAIR_HITS) {
                    repairWallsAndRamparts.push(structure);
                }
            }
            else if(structure.structureType === STRUCTURE_CONTAINER){
                if(structureHits < Repairer.CONTAINER_REPAIR_THRESHOLD * structureMaxHits) {
                    repairContainers.push(structure);
                }
            }
            else {
                otherStructures.push(structure);
            }
        }

        let  repairStructures:RepairableStructure[] = [];
        let repairHits:number|undefined = undefined;

        if(repairWallsAndRamparts.length>0) {
            repairStructures=repairWallsAndRamparts;
            repairHits=Repairer.WALL_REPAIR_HITS
            console.log('walls and ramparts found');
        }
        else if(repairContainers.length>0) {
            repairStructures=repairContainers;
            repairHits=Repairer.CONTAINER_REPAIR_THRESHOLD * Repairer.CONTAINER_MAX_HITS;
            console.log('repairHits',repairHits);
            console.log('containers found');
        }
        else if(otherStructures.length>0) {
            repairStructures=otherStructures;
            repairHits=undefined;
            console.log('other structures found');
        }
        if(repairStructures.length===0) {
            return
        }
        repairStructures.sort((a,b)=>a.hits-b.hits)
        const leastHitPointStructure = repairStructures.shift();
        const repairTask:RepairTask = {
            taskType: TasksType.REPAIR,
            data: {
                repairStructureId: leastHitPointStructure.id,
                repairHits: repairHits,
            }
        }

        return repairTask;
    }

    
}