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