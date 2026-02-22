


export const clearDeadCreepMemory = () => {
    const creepNames = Object.keys(Memory.creeps);
    creepNames.forEach(creepName => {
        if(!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    });
}