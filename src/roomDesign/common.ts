import { Coord } from "../types/geometry";



interface ConstructStructureInRoomParams {
    room: Room;
    constructionCoords: Coord|Coord[];
    structureType: BuildableStructureConstant;
    onSuccess?:(Coord:Coord) => void;
    onFailure?:(Coords:Coord) => void;
}

export const constructStructuresAtCoords = (params: ConstructStructureInRoomParams) => {
    const { 
        room, 
        constructionCoords, 
        structureType, 
        onSuccess, 
        onFailure 
    } = params;

    const constructionCoordsList=Array.isArray(constructionCoords)?constructionCoords:[constructionCoords];


    constructionCoordsList.forEach(coord => {
        const constructionResult = room.createConstructionSite(coord.x, coord.y, structureType);
        if(constructionResult === OK) {
            onSuccess?.(coord);
        } else {
            onFailure?.(coord);
        }
    })
}