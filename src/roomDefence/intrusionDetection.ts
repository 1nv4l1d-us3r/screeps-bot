import { findHostileCreepsInRoom } from "./base";


export const handleIntrusionDetection = (room: Room) => {

    const isSafeModeActive = Boolean(room.controller?.safeMode);

    if (isSafeModeActive) {
        return;
    }
    else {
        const hostileCreeps = findHostileCreepsInRoom(room);
        if (hostileCreeps.length < 1) {
            room.memory.hostileCreepsPresent = false;
            return;
        }
        else {
            room.memory.hostileCreepsPresent = true;
            return;
        }
    }
}