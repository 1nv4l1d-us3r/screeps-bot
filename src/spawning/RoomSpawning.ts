import { CreepRoles } from "../roles/base";
import { WorkerCreep } from "../roles";



const WorkerBodyParts: Record<CreepRoles, BodyPartConstant[]> = {
    [CreepRoles.HARVESTER]: [WORK, CARRY, MOVE, MOVE],
    [CreepRoles.UPGRADER]: [WORK, CARRY, MOVE, MOVE],
    [CreepRoles.BUILDER]: [WORK, CARRY, MOVE, MOVE],
}



const getWorkerBodyParts = (budget: number,bodyParts: BodyPartConstant[]) => {

    const bodyPartsSetCost = bodyParts.reduce((acc, part) => acc + BODYPART_COST[part], 0);

    const affordableSetCount = Math.floor(budget / bodyPartsSetCost);

    console.log(`Affordable Set Count: ${affordableSetCount}`);
    console.log(`Body Parts Set Cost: ${bodyPartsSetCost}`);
    console.log(`Budget: ${budget}`);
    console.log(`Body Parts: ${bodyParts.join(', ')}`);
    

    let bodyArray: BodyPartConstant[]

    if(affordableSetCount <=1) {
        bodyArray = bodyParts;
    }
    else {
        bodyArray = Array(affordableSetCount).fill(bodyParts)
        console.log(bodyArray,'bodyArray');
    }
    return bodyArray;
}





const getRoomWorkers = (room: Room): Record<CreepRoles, number> => {

    const roomWorkers: Record<CreepRoles, number> = {
        [CreepRoles.HARVESTER]: 6,
        [CreepRoles.UPGRADER]: 2,
        [CreepRoles.BUILDER]: 2,
    }

    return roomWorkers;
}







export const handleRoomSpawning = (room: Room) => {
    console.log(`Spawning in room: ${room.name}`);

    const roomWorkers = getRoomWorkers(room);
    const roomWorkerCount = Object.values(roomWorkers).reduce((acc, count) => acc + count, 0);

    const roomCreeps = Object.values(Game.creeps)
        .filter(
            creep => creep.my && creep.room.name === room.name
        ) as WorkerCreep[];
    console.log(`Room Creeps: ${roomCreeps.length}`);
    console.log(`Room Worker Count: ${roomWorkerCount}`);

    if(roomCreeps.length < roomWorkerCount) {
        const creepRoles=roomCreeps.reduce((acc, creep) => {
            acc[creep.memory.role] = (acc[creep.memory.role] || 0) + 1;
            return acc;
        }, {} as Record<CreepRoles, number>);

        for(const role of Object.keys(roomWorkers) as CreepRoles[]) {
            const roleCount = roomWorkers[role];
            const presentRoleCount = creepRoles[role] || 0;

            console.log(`Role: ${role}, Role Count: ${roleCount}, Present Role Count: ${presentRoleCount}`);

            if(presentRoleCount < roleCount) {
                const spawnRole = role ;
                const roomSpawns = room.find(FIND_MY_SPAWNS).filter(spawn => spawn.spawning === null);
                if(!roomSpawns.length) {
                    return ;
                }
                const spawn = roomSpawns[0];
                const spawnBodyParts = getWorkerBodyParts(room.energyCapacityAvailable, WorkerBodyParts[spawnRole]);




                const newCreepName = `worker-${spawnRole}-${Game.time}`;
                const newCreepMemory:WorkerCreep['memory'] = {
                    role: spawnRole,
                    isHarvesting: true
                }

                spawn.spawnCreep(
                    spawnBodyParts, 
                    newCreepName, {
                        memory: newCreepMemory  
                    }
                );
            }


        }
    

    }

}
