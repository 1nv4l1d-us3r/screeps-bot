import { TickCache } from "helpers/cache";



export class CommonFunctions {



    @TickCache(() => 'myRooms')
    public static getMyRooms(){
        const myRooms: Room[] = []
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName]
            if (room.controller?.my) {
                myRooms.push(room)
            }
        }
        return myRooms
    }

    @TickCache(() => 'allWorkers')
    public static getAllWorkers(): Creep[] {
        return Object.values(Game.creeps)
    }


    @TickCache((room: Room) => room.name)
    public static getRoomWorkers(room: Room): Creep[] {
        return CommonFunctions.getAllWorkers().filter(creep => creep.room.name === room.name)
    }
}



