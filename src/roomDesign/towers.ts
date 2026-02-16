import { getGridAroundPosition} from "../grid/utils";

import { getMaxAttackPowerFromTowers, getTowerAttackPowerByRange } from "../roomDefence/towerDefence";



interface GetBestTowerConstructionPositionParams {
    room: Room;
    baseCenter: RoomPosition;
    existingTowerPositions: RoomPosition[];
    excludePositions?: RoomPosition[];
}



export const getBestTowerConstructionPosition = (params: GetBestTowerConstructionPositionParams) => {

    const {
        room,
        baseCenter,
        existingTowerPositions,
        excludePositions
    } = params;

    console.log('constructing towers in room', room.name);


    const roomTerrain = room.getTerrain();
    const maxDistanceFromBase = 15;
    const positionsAroundBase = getGridAroundPosition(baseCenter, maxDistanceFromBase);
    console.log('positionsAroundBase', positionsAroundBase.length);

    let validTowerConstructionPositions = positionsAroundBase.filter(pos => {
        return (
            roomTerrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL
            && !excludePositions?.some(excludePos => excludePos.isEqualTo(pos))
        )
    });


    const exitPositions = room.find(FIND_EXIT);

    const totalExitAttackPower = exitPositions.reduce(
        (acc, exitPos) => {
        const bestTowerAttackPower = getMaxAttackPowerFromTowers(exitPos, existingTowerPositions);
        return acc + bestTowerAttackPower;
    }, 0);
    const avgExistingExitAttackPower = totalExitAttackPower / exitPositions.length;


    
    const costFunction = (cellPosition: RoomPosition) => {

        const simulatedTowerPositions = [...existingTowerPositions, cellPosition];

        const simulatedTotalExitAttackPower = exitPositions
            .map(exitPos=>getMaxAttackPowerFromTowers(exitPos, simulatedTowerPositions))
            .reduce((total,p)=>total+p, 0);

        const avgCellAttackPower = simulatedTotalExitAttackPower / exitPositions.length;
        const cost = avgCellAttackPower - avgExistingExitAttackPower;

        return cost;
    }

    const costMatrix: Record<string, number> = validTowerConstructionPositions.reduce((acc, pos) => {
        acc[pos.toString()] = costFunction(pos);
        return acc;
    }, {});

    let bestCell: RoomPosition | undefined = undefined;
    let maxCost: number = -Infinity

    for (const pos of validTowerConstructionPositions) {
        const key = pos.toString();
        const cost = costMatrix[key];
        if (cost === undefined) {
            continue;
        }
        if (cost > maxCost) {
            maxCost = cost;
            bestCell = pos;
        }
    }
    if (!bestCell) {
        console.log('no valid tower construction positions found');
        return;
    }
    return bestCell;
}