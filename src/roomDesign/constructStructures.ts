import { findCenter, getFullGridPositions, getGridAroundPosition } from "../grid/utils";



const MAX_EXTENSIONS_BY_LEVEL: Record<number, number> = {
    1: 0,
    2: 5,
    3: 10,
    4: 20,
    5: 30,
    6: 40,
    7: 50,
    8: 60
}

const MAX_TOWERS_BY_LEVEL: Record<number, number> = {
    1: 0,
    2: 0,
    3: 1,
    4: 1,
    5: 2,
    6: 2,
    7: 3,
    8: 6,
}


export const constructStructuresInRoom = (room: Room) => {

    const roomLevel = room.controller?.level || 0;
    const roomStructures = room.find(FIND_STRUCTURES);
    const roomConstructionsSites=room.find(FIND_CONSTRUCTION_SITES);

    const spawns=roomStructures.filter(structure => structure.structureType === STRUCTURE_SPAWN);

    const currentExtensionsCount=roomStructures.filter(structure => structure.structureType === STRUCTURE_EXTENSION).length;
    const constructingExtensionsCount=roomConstructionsSites.filter(site => site.structureType === STRUCTURE_EXTENSION).length;

    const totalExtensionsCount=currentExtensionsCount+constructingExtensionsCount;
    const MAX_EXTENSIONS_COUNT=MAX_EXTENSIONS_BY_LEVEL[roomLevel];

    if(totalExtensionsCount < MAX_EXTENSIONS_COUNT) {
        console.log('need to construct extensions in room', room.name);
    }


    const existingTowers=roomStructures.filter(structure => structure.structureType === STRUCTURE_TOWER);
    const existingTowersCount=existingTowers.length;
    const constructingTowers=roomConstructionsSites.filter(site => site.structureType === STRUCTURE_TOWER);
    const constructingTowersCount=constructingTowers.length;
    const totalTowersCount=existingTowersCount+constructingTowersCount;
    const MAX_TOWERS_COUNT=MAX_TOWERS_BY_LEVEL[roomLevel];
    if(totalTowersCount < MAX_TOWERS_COUNT) {
        const needToConstructTowersCount=MAX_TOWERS_COUNT-totalTowersCount;
        constructTowersInRoom({
            room,
            spawns,
            existingTowers,
            constructingTowers,
            constructionCount: needToConstructTowersCount
        });
    }
}


interface ConstructTowersInRoomParams {
    room: Room;
    spawns: StructureSpawn[];
    existingTowers: StructureTower[];
    constructingTowers: ConstructionSite[];
    constructionCount: number;
}





const constructTowersInRoom = (params: ConstructTowersInRoomParams) => {

    const { 
        room, 
        spawns,
        existingTowers, 
        constructingTowers, 
        constructionCount 
    } = params;

    console.log('constructing towers in room', room.name);


    const roomTerrain=room.getTerrain();
    console.log('finding center of base');
    const baseCenter = findCenter(spawns.map(spawn => spawn.pos));
    console.log('baseCenter', baseCenter.toString());

    const maxDistanceFromBase = 20;
    const positionsAroundBase = getGridAroundPosition(baseCenter, maxDistanceFromBase);
    console.log('positionsAroundBase', positionsAroundBase.length);

    let validTowerConstructionPositions = positionsAroundBase.filter(pos => {
        return roomTerrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL;
    });

    //  remove existing towers and constructing towers from validGridPositions

    existingTowers.forEach(tower => {
        validTowerConstructionPositions = validTowerConstructionPositions.filter(pos => !pos.isEqualTo(tower.pos));
    });
    constructingTowers.forEach(site => {
        validTowerConstructionPositions = validTowerConstructionPositions.filter(pos => !pos.isEqualTo(site.pos));
    });

    const exitPositions = room.find(FIND_EXIT);

    const costFunction = (cellPosition: RoomPosition) => {
        const cumulativeDistaceFromExits=exitPositions.reduce((acc, exit) => {
            return acc + exit.getRangeTo(cellPosition);
        }, 0);
        return cumulativeDistaceFromExits;
    }

    const costMatrix: Record<string,number> = validTowerConstructionPositions.reduce((acc, pos) => {
        acc[pos.toString()] = costFunction(pos);
        return acc;
    }, {});

    let bestCell:RoomPosition|undefined = undefined;
    let leastCost:number=Infinity

    for(const pos of validTowerConstructionPositions) {
        const key=pos.toString();
        const cost=costMatrix[key];
        if(cost===undefined) {
            continue;
        }
        if(cost<leastCost) {
            leastCost = cost;
            bestCell = pos;
        }
    }
    if(!bestCell) {
        console.log('no valid tower construction positions found');
        return;
    }
    console.log('constructing tower at', bestCell.toString());
    const constructionResult = room.createConstructionSite(bestCell, STRUCTURE_TOWER);
    if(constructionResult === OK) {
        console.log('tower constructed successfully at', bestCell.toString());
    }
    else {
        console.log('failed to construct tower at', bestCell.toString());
        console.log('constructionResult', constructionResult);
    }


}