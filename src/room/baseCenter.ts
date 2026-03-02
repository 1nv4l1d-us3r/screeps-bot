import { findCenterCoord } from "../geometry";
import { Coord } from "../types/geometry";

export const getRoomBaseCenterCoord = (room: Room) => {

    const importantStructureCoords:Coord[]=[];

    const roomSpawns=room.find(FIND_MY_SPAWNS);
    // TODO: use cache provider to get the room spawns
    roomSpawns.forEach(spawn => {
        importantStructureCoords.push({x:spawn.pos.x, y:spawn.pos.y});
    });

    const sources=room.find(FIND_SOURCES);
    // TODO: use cache provider to get the room sources
    sources.forEach(source => {
        importantStructureCoords.push({x:source.pos.x, y:source.pos.y});
    });

    const controller=room.controller
    if(controller) {
        importantStructureCoords.push({x:controller.pos.x, y:controller.pos.y});
    }
    const roomStorage=room.storage;
    if(roomStorage) {
        importantStructureCoords.push({x:roomStorage.pos.x, y:roomStorage.pos.y});
    }
    if(importantStructureCoords.length===0) {
        const roomCenterCoord={x:25, y:25};
        return roomCenterCoord;
    }

    const baseCenterCoord=findCenterCoord(importantStructureCoords);
    return baseCenterCoord;

}