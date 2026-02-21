import { findCenter, isPositionReachable, spiralPositionsGenerator } from "../grid/utils";



interface GetFirstSpawnConstructionPositionParams {
    room: Room;
    roomTerrain: RoomTerrain;
    inValidBuildPositions: Set<string>;
}
export const getFirstSpawnConstructionPosition = (params: GetFirstSpawnConstructionPositionParams) => {

    const {room, roomTerrain, inValidBuildPositions} = params;

    const controller=room.controller;
    if(!controller) {
        return;
    }
    
    const sources=room.find(FIND_SOURCES);

    const criticalPositions=[...sources,controller].map(st => st.pos);

    const center=findCenter(criticalPositions);

    let foundPosition:RoomPosition|undefined;

    const yieldFunction = (pos: RoomPosition) => {
        if(inValidBuildPositions.has(pos.toString())) {
            return false;
        }
        if(roomTerrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
            inValidBuildPositions.add(pos.toString());
            return false;
        }
        if(!isPositionReachable(pos, inValidBuildPositions)) {
            inValidBuildPositions.add(pos.toString());
            return false;
        }
        foundPosition=pos;
        return true;
    }

    spiralPositionsGenerator({
        center,
        yieldFunction,
    });
    return foundPosition;
}