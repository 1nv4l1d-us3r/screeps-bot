enum MapDirections {
    NORTH = 'N',
    EAST = 'E',
    SOUTH = 'S',
    WEST = 'W',
}

type verticalDirection = MapDirections.NORTH | MapDirections.SOUTH;
type horizontalDirection = MapDirections.EAST | MapDirections.WEST;


type RoomName = `${horizontalDirection}${number}${verticalDirection}${number}`;


interface DecodedRoomName {
    verticalDirection: verticalDirection;
    verticalIndex: number;
    horizontalDirection: horizontalDirection;
    horizontalIndex: number;
}


export class RoomNameHelper {

    private static readonly MIN_ROOM_INDEX = 0;
    private static readonly MAX_ROOM_INDEX = 60;


    private static isValidRoomIndex(index: number): boolean {
        return index >= this.MIN_ROOM_INDEX && index <= this.MAX_ROOM_INDEX;
    }

    public static encodeRoomName(input: DecodedRoomName): RoomName {
        return `${input.horizontalDirection}${input.horizontalIndex}${input.verticalDirection}${input.verticalIndex}`;
    }


    public static decodeRoomName(roomName: RoomName | string): DecodedRoomName {
        const match = roomName.match(/^([EW])(\d+)([NS])(\d+)$/);
        if (!match) throw new Error(`Invalid room name: ${roomName}`);

        const horizontalDirection = match[1] as horizontalDirection;
        const horizontalIndex = parseInt(match[2], 10);
        const verticalDirection = match[3] as verticalDirection;
        const verticalIndex = parseInt(match[4], 10);

        if (!this.isValidRoomIndex(horizontalIndex) || !this.isValidRoomIndex(verticalIndex)) {
            throw new Error(`Room index out of bounds in ${roomName}`);
        }
        
        return {
            horizontalDirection,
            horizontalIndex,
            verticalDirection,
            verticalIndex,
        };
    }

    public static roomNameToXY(roomName: RoomName | string): { x: number, y: number } {
        const {
            horizontalDirection,
            horizontalIndex,
            verticalDirection,
            verticalIndex
        } = this.decodeRoomName(roomName);


        const x =
            horizontalDirection === MapDirections.EAST
                ? horizontalIndex
                : -horizontalIndex - 1;

        const y =
            verticalDirection === MapDirections.NORTH
                ? verticalIndex
                : -verticalIndex - 1;

        return { x, y };
    }

    public static xyToRoomName(x: number, y: number): RoomName {
        const horizontalDirection =
            x >= 0 ? MapDirections.EAST : MapDirections.WEST;

        const horizontalIndex =
            x >= 0 ? x : Math.abs(x) - 1;

        const verticalDirection =
            y >= 0 ? MapDirections.NORTH : MapDirections.SOUTH;

        const verticalIndex =
            y >= 0 ? y : Math.abs(y) - 1;

        return RoomNameHelper.encodeRoomName({ verticalDirection, verticalIndex, horizontalDirection, horizontalIndex });
    }


    public static getRoomNamesInRange(center: RoomName | string, range: number, includeCenter = false): RoomName[] {
        const { x, y } = RoomNameHelper.roomNameToXY(center);
        const result: RoomName[] = [];

        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                const nx = x + dx;
                const ny = y + dy;

                
                if (!includeCenter && nx === x && ny === y) {
                    continue;
                }
                const room = RoomNameHelper.xyToRoomName(nx, ny);
                const decodeRoomName = RoomNameHelper.decodeRoomName(room);

                if (
                    RoomNameHelper.isValidRoomIndex(decodeRoomName.horizontalIndex) &&
                    RoomNameHelper.isValidRoomIndex(decodeRoomName.verticalIndex)
                ) {
                    result.push(room);
                }
            }
        }

        return result;
    }

}




const testingFunction = () => {
    const roomName = 'E27S13';
    const nearbyRoomNames = RoomNameHelper.getRoomNamesInRange(roomName, 1);
    console.log(nearbyRoomNames);
}

testingFunction();