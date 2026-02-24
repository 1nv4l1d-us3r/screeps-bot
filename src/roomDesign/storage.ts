import { StructureConstructionConfig } from "./common";
import { Coord, PackedCoord } from "../types/geometry";
import { getMaxReachableNeighborCoords } from "../geometry/coords";
import { findCenterCoord, isCoordReachable } from "../geometry";
import { spiralCordsGenerator } from "../geometry";

interface GetStorageStructureConfigsParams {
    room: Room;
    spawns: StructureSpawn[];
    roomTerrain: RoomTerrain;
    occupiedPackedCoordsSet: Set<PackedCoord>;
}

export const getStorageStructureConfig = (params: GetStorageStructureConfigsParams) => {

    const {room, spawns, roomTerrain, occupiedPackedCoordsSet} = params;
    
    const firstSpawn=spawns[0];
    

    const adjToFirstSpawnCoord=getMaxReachableNeighborCoords({center:firstSpawn.pos, roomTerrain})

    if(adjToFirstSpawnCoord) {
        const storageConfig: StructureConstructionConfig = {
            coord: adjToFirstSpawnCoord,
            structureType: STRUCTURE_STORAGE
        }
        return storageConfig;
    }
    
    const sources=room.find(FIND_SOURCES);
    const criticalStructures:(Structure|Source)[]=[...sources,...spawns].filter(st=>st !== undefined);

    const roomController=room.controller
    if(roomController) {
        criticalStructures.push(roomController);
    }

    const criticalStructuresCoords=criticalStructures.map(st => ({x:st.pos.x, y:st.pos.y}) as Coord);
    const baseCenter=findCenterCoord(criticalStructuresCoords);

    let  storageCoord:Coord|undefined=undefined;

    const yieldFunction = (coord: Coord, index: number) => {
        if(index%2!==0) {
            return false;
        }
        if(roomTerrain.get(coord.x, coord.y) === TERRAIN_MASK_WALL) {
            return false;
        }
        if(!isCoordReachable({ coord, occupiedPackedCoordsSet })) {
            return false;
        }
        storageCoord=coord;
        return true;
    }



    spiralCordsGenerator({
        center:baseCenter,
        yieldFunction,
    });
    if(storageCoord) {
        const storageConfig: StructureConstructionConfig = {
            coord: storageCoord,
            structureType: STRUCTURE_STORAGE
        }
        return storageConfig;
    }
    return 
}
