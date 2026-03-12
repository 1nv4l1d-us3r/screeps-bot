import { Scheduler } from "helpers/Scheduler";
import { getMyRooms } from "utils/commonFunctions";

export class DefenceManager {

    private static readonly HarmfulCreepBodyParts:Set<BodyPartConstant>= new Set([ATTACK, RANGED_ATTACK, CLAIM, WORK]);


    public static startDeamon(){
        Scheduler.createRecurringJob({
            name: 'DefenceManagerDeamon',
            interval: 5,
            func: DefenceManager.startIntrusionDetectionJobs,
        })
    }


    public static startIntrusionDetectionJobs=()=>{
        getMyRooms().forEach(
            (room:Room,index:number) => {
                Scheduler.createOneTimeJob({
                    name: `IntrusionDetection-${room.name}`,
                    delay: Math.max(1,index%5),
                    func: () => DefenceManager.handleIntrusionDetection(room),
                })
            }
        );


    }



    public static handleIntrusionDetection(room: Room) {
        const hostileCreepsPresent = this.findHostileCreeps(room,true);
        if(hostileCreepsPresent) {
            room.memory.hasHostileCreeps = true;
        }
        else {
            room.memory.hasHostileCreeps = false;
        }
    }

    private static findHostileCreeps(room: Room,includePowerCreeps:boolean=false) {

        const hostileCreeps: (Creep|PowerCreep)[] = [];
        const enemyCreeps= room.find(FIND_HOSTILE_CREEPS, {
            filter: (c) => c.body.some(part => this.HarmfulCreepBodyParts.has(part.type))
        });
        hostileCreeps.push(...enemyCreeps);
        if(includePowerCreeps) {
            const enemyPowerCreeps = room.find(FIND_HOSTILE_POWER_CREEPS);
            hostileCreeps.push(...enemyPowerCreeps);
        }
        return hostileCreeps;
    }



    public static handleDefence(){
        getMyRooms().forEach(
            room=>{
                if(room.memory.hasHostileCreeps) {
                    this.handleRoomDefence(room);
                }
            }
        );
    }
    

    private static handleRoomDefence(room: Room) {

        const isSafeModeActive = Boolean(room.controller?.safeMode);
        if(isSafeModeActive) {
            return;
        }

        const hostileCreeps=this.findHostileCreeps(room,true);
        if(!hostileCreeps.length) {
            return;
        }
        const towers:StructureTower[] = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.energy > 0
        });
        if(!towers.length) {
            console.log(`${room.name}: no towers to defend room , activating safe mode`);
            room.controller?.activateSafeMode();
            return;
        }
        for(const tower of towers) {
            const closestHostileCreep = tower.pos.findClosestByRange(hostileCreeps);
            if(closestHostileCreep) {
                tower.attack(closestHostileCreep);
            }
        }
    }
}

export const defenceManager = new DefenceManager();