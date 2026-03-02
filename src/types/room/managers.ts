import { Coord } from "../geometry";

export interface ConstructionRequest{
    coord:Coord,
    structureType:BuildableStructureConstant,
    replaceExisting?:boolean,
}


export interface RoomOperations{
    constructionRequests:ConstructionRequest[],
}
