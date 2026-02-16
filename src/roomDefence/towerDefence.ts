import { findHostileCreepsInRoom } from "./base";


const TOWER_OPTIMAL_RANGE=5
const TOWER_WORST_RANGE=20
const TOWER_OPTIMAL_ATTACK=600
const TOWER_WORST_ATTACK=150

// derived constants for linear falloff calculations
// range in which effect falloff occurs
const TOWER_EFFECT_FALL_RANGE=TOWER_WORST_RANGE-TOWER_OPTIMAL_RANGE;

// max attack power fall factor
const MAX_TOWER_ATTACK_FALL=TOWER_OPTIMAL_ATTACK-TOWER_WORST_ATTACK;
const TOWER_ATTACK_FALL_FACTOR=MAX_TOWER_ATTACK_FALL/TOWER_EFFECT_FALL_RANGE;


export const getTowerAttackPowerByRange = (range: number) => {
    if(range <= TOWER_OPTIMAL_RANGE) {
        return TOWER_OPTIMAL_ATTACK;
    }
    if(range >= TOWER_WORST_RANGE) {
        return TOWER_WORST_ATTACK;
    }
    return TOWER_OPTIMAL_ATTACK - TOWER_ATTACK_FALL_FACTOR * (range - TOWER_OPTIMAL_RANGE);
}



export const getMaxAttackPowerFromTowers = ( targetPosition: RoomPosition, towersPositions: RoomPosition[]) => {
    const closestTowerPosition = towersPositions.reduce((acc, towerPos) => {
        const distance = targetPosition.getRangeTo(towerPos);
        return distance < acc ? distance : acc;
    }, Infinity);
    return getTowerAttackPowerByRange(closestTowerPosition);
}



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