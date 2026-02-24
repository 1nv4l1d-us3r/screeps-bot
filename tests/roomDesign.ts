import { constructStructuresInRoom } from "../src/roomDesign/constructStructures";

export const testRoomDesign = () => {
    
    for(const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if(!room) {
            continue;
        }
        constructStructuresInRoom(room);
    }
}
