import { Coord } from "../types/geometry";



interface ConstructStructureInRoomParams {
    room: Room;
    constructionCoords: Coord|Coord[];
    structureType: BuildableStructureConstant;
    force?: boolean;
    onSuccess?:(Coord:Coord) => void;
    onFailure?:(Coords:Coord) => void;
}

export const constructStructuresAtCoords = (params: ConstructStructureInRoomParams) => {
    const { 
        room, 
        constructionCoords, 
        structureType, 
        force=false,
        onSuccess, 
        onFailure 
    } = params;

    const constructionCoordsList=Array.isArray(constructionCoords)?constructionCoords:[constructionCoords];


    constructionCoordsList.forEach(coord => {
        const constructionResult = room.createConstructionSite(coord.x, coord.y, structureType);
        if(constructionResult === OK) {
            onSuccess?.(coord);
        }
        else if(force && constructionResult === ERR_INVALID_TARGET) {
            const existingStructure = room.lookForAt(LOOK_STRUCTURES, coord.x, coord.y);
            const destoryStructures = existingStructure.filter((st=>st.structureType!=STRUCTURE_RAMPART))
            destoryStructures.forEach(st=>st.destroy())
            const existingConstructionSite = room.lookForAt(LOOK_CONSTRUCTION_SITES, coord.x, coord.y);
            existingConstructionSite.forEach(cs=>cs.remove())
            const retryConstructionResult = room.createConstructionSite(coord.x, coord.y, structureType);
            if(retryConstructionResult === OK) {
                onSuccess?.(coord);
            }
            else {
                onFailure?.(coord);
            }
        }
        else {
            onFailure?.(coord);
        }
    })
}


export interface StructureConstructionConfig{
    coord: Coord;
    structureType: BuildableStructureConstant;
}