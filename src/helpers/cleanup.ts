

import { Scheduler } from "./Scheduler";


export class Cleanup {


    public static startDeamon() {
        Scheduler.createRecurringJob({
            name: 'CleanupDeamon',
            interval: 100,
            func: this.clearDeadCreepMemory,
        });
    }


    public static clearDeadCreepMemory() {
        const creepNames = Object.keys(Memory.creeps);
        creepNames.forEach(creepName => {
            if(!Game.creeps[creepName]) {
                delete Memory.creeps[creepName];
            }
        });
    }
}
