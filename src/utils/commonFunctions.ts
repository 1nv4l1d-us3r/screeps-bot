
export const getMyRooms=()=>{
    const myRooms:Room[]=[]

    for(let roomName in Game.rooms){
        const room=Game.rooms[roomName]
        if(room.controller?.my){
            myRooms.push(room)
        }
    }
    return myRooms
}

export const getAllWorkers=()=>{
    return Object.values(Game.creeps)
}

export const getRoomWorkers=(room:Room)=>{
    return getAllWorkers()
        .filter(
                creep => creep.room.name === room.name
            )
}