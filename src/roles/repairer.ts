import { Worker } from "types/worker";
import { WorkerRoles } from "types/roles";
import { RepairableStructure, RepairTask, TasksType, WithdrawResourceTask } from "types/tasks";
import { upgraderRole } from "./upgrader";



type RepairerWorker = Worker<WorkerRoles.REPAIRER>;

export class Repairer {

    private static WALL_REPAIR_HITS = 5000;
    private static CONTAINER_REPAIR_THRESHOLD = 0.8;
    private static CONTAINER_MAX_HITS = 250000;




    public static handleRepairerRole(worker: RepairerWorker) {

        if(worker.store.getUsedCapacity()>0) {

            const repairTask = this.findRepairTaskData(worker);
            if(repairTask) {
                worker.memory.task = repairTask;
            }
            else {
                upgraderRole(worker);
            }

        }
        if(worker.store.getUsedCapacity()==0) {
            const withdrawEnergyTask: WithdrawResourceTask = {
                taskType: TasksType.WITHDRAW_RESOURCE,
                data: {
                    withdrawStructureId: 'auto',
                    resourceType: RESOURCE_ENERGY,
                }
            }
            worker.memory.task = withdrawEnergyTask;
        }
    }





    private static findRepairTaskData(worker: RepairerWorker) {
        const room = worker.room;
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
            if(
                (structure.structureType === STRUCTURE_WALL
                || structure.structureType === STRUCTURE_RAMPART
                )
                    && structureHits < Repairer.WALL_REPAIR_HITS) {
                repairWallsAndRamparts.push(structure);
            }
            else if(
                structure.structureType === STRUCTURE_CONTAINER
                && structureHits < Repairer.CONTAINER_REPAIR_THRESHOLD * structure.hits
            ){
                repairContainers.push(structure);
            }
            else if(structure) {
                otherStructures.push(structure);
            }
        }

        let  repairStructures:RepairableStructure[] = [];
        let repairHits:number|undefined = undefined;

        if(repairWallsAndRamparts.length>0) {
            repairStructures=repairWallsAndRamparts;
            repairHits=Repairer.WALL_REPAIR_HITS
        }
        if(repairContainers.length>0) {
            repairStructures=repairContainers;
            repairHits=Repairer.CONTAINER_REPAIR_THRESHOLD * Repairer.CONTAINER_MAX_HITS;
        }
        if(otherStructures.length>0) {
            repairStructures=otherStructures;
            repairHits=undefined;
        }
        if(repairStructures.length===0) {
            return
        }
        repairStructures.sort((a,b)=>a.pos.getRangeTo(worker.pos)-b.pos.getRangeTo(worker.pos))
        const closestStructure = repairStructures.shift();
        const repairTask:RepairTask = {
            taskType: TasksType.REPAIR,
            data: {
                repairStructureId: closestStructure.id,
                repairHits: repairHits,
            }
        }

        return repairTask;
    }

    
}