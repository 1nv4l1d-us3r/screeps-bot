import { tickCachedFn } from "helpers/cache";

export const getMyRooms = tickCachedFn('myRooms', (): Room[] => {
    const myRooms: Room[] = []
    for (let roomName in Game.rooms) {
        const room = Game.rooms[roomName]
        if (room.controller?.my) {
            myRooms.push(room)
        }
    }
    return myRooms
})



export const getAllWorkers=tickCachedFn('allWorkers', (): Creep[] => {
    return Object.values(Game.creeps)
})



export const getMyWorkers=tickCachedFn('myWorkers', (): Creep[] => {
    return getAllWorkers()
        .filter(
                creep => creep.my
            )
})