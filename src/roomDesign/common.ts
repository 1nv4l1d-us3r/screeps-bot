import { Coord } from "../types/geometry";



interface ConstructStructureInRoomParams {
    room: Room;
    constructionCoords: Coord[];
    structureType: BuildableStructureConstant;
    onSuccess?:(successCoord:Coord) => void;
    onFailure?:(failureCoord:Coord) => void;
}

export const constructStructuresAtCoords = (params: ConstructStructureInRoomParams) => {
    const { 
        room, 
        constructionCoords, 
        structureType, 
        onSuccess, 
        onFailure 
    } = params;


    constructionCoords.forEach(coord => {
        const constructionResult = room.createConstructionSite(coord.x, coord.y, structureType);
        if(constructionResult === OK) {
            onSuccess?.(coord);
        } else {
            onFailure?.(coord);
        }
    })
}