import { findHostileCreepsInRoom } from "./base";



export const handleRoomTowerDefence = (room: Room) => {

    const hostileCreeps=findHostileCreepsInRoom(room);
    if(!hostileCreeps.length) {
        room.memory.hostileCreepsPresent = false;
        return;
    }

    const towers = room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_TOWER
    });
    if(!towers.length) {
        console.log(`${room.name}: no towers found in room , cannot defend`);
        if(room.controller?.safeMode) {
            console.log(`${room.name}: safe mode is active, ignoring`);
            return;
        }
        room.controller?.activateSafeMode();
        console.log(`${room.name}: activating safe mode`);
        return;
    }
    for(const tower of towers) {
        const closestHostileCreep = tower.pos.findClosestByRange(hostileCreeps);
        if(closestHostileCreep) {
            tower.attack(closestHostileCreep);
        }
    }
   
}