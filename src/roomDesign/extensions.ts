import { spiralPositionsGenerator, isPositionReachable } from "../grid/utils";




interface GetExtensionsConstructionPositionsParams {
    baseCenter: RoomPosition;
    inValidBuildPositions: Set<string>;
    roomTerrain: RoomTerrain;
    extensionsNeededCount: number;
}

export const getExtensionsConstructionPositions= (params: GetExtensionsConstructionPositionsParams) => {
    const { 
        baseCenter, 
        inValidBuildPositions,
        roomTerrain, 
        extensionsNeededCount
    } = params;


    const positionsFound:RoomPosition[] = [];
    let yieldIndex=0;
    const yieldFunction = (pos: RoomPosition) => {
        yieldIndex++;
        if(yieldIndex%2!==0) {
            return false;
        }
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
        positionsFound.push(pos);
        return positionsFound.length>=extensionsNeededCount;
    }
    spiralPositionsGenerator({
        center:baseCenter,
        yieldFunction,
    });
    return positionsFound;
}