export const ROOM_SIZE = 50;

export const getMaxBuildableStructuresByLevel = (structureType: BuildableStructureConstant, rcl: number) => {
    return CONTROLLER_STRUCTURES[structureType][rcl];
}









