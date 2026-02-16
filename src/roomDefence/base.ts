
export interface RoomDefenceMemory{
    hostileCreepsPresent?:boolean;
}

export const HarmfulCreepBodyParts:BodyPartConstant[]= [ATTACK, RANGED_ATTACK,CLAIM];



export const findHostileCreepsInRoom = (room: Room) => {
    const enemyCreeps: (Creep|PowerCreep)[] = [];

    const hostileCreeps = room.find(FIND_HOSTILE_CREEPS, {
        filter: (c) => c.body.some(part => HarmfulCreepBodyParts.includes(part.type))
    });
    if(hostileCreeps.length > 0) {
        enemyCreeps.push(...hostileCreeps);
    }
    const hostilePowerCreeps = room.find(FIND_HOSTILE_POWER_CREEPS);
    if(hostilePowerCreeps.length > 0) {
        enemyCreeps.push(...hostilePowerCreeps);
    }
    return enemyCreeps;

}