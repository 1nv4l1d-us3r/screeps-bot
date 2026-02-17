// global way of test Scripts execution
import { findCenter, getGridAroundPosition, spiralPositionsGenerator } from "./grid/utils";
import { getBestTowerConstructionPosition } from './roomDesign/towers';

const testTowerPlacement = () => {
    const room=Game.rooms['E28S12'];

    if(!room) {
        console.log('Room E28S12 not found');
        return;
    }
    const existingStructures = room.find(FIND_STRUCTURES);
    const existingConstructionsSites = room.find(FIND_CONSTRUCTION_SITES);
    const spawns=existingStructures.filter(st => st.structureType === STRUCTURE_SPAWN);
    const occupiedPositions=[...existingStructures,...existingConstructionsSites].map(st => st.pos);
    
    const baseCenter = findCenter(spawns.map(spawn => spawn.pos));
    
    const bestTowerConstructionPosition = getBestTowerConstructionPosition({
        room,
        baseCenter,
        existingTowerPositions:occupiedPositions,
        excludePositions:occupiedPositions
    });
    console.log('bestTowerConstructionPosition', bestTowerConstructionPosition);
}


const testGridSize = () => {

    const room=Game.rooms['E28S12'];
    if(!room) {
        console.log('Room E28S12 not found');
        return;
    }
    const structures=room.find(FIND_STRUCTURES);
    const constructionSites=room.find(FIND_CONSTRUCTION_SITES);
    const occupiedPositions=[...structures,...constructionSites].map(st => st.pos);

    const spawns=structures.filter(st => st.structureType === STRUCTURE_SPAWN);
    const baseCenter = findCenter(spawns.map(spawn => spawn.pos));
 
    
    const gridSize=15;
    const gridPositions=getGridAroundPosition(baseCenter, gridSize);
    const validGridPositions=gridPositions.filter(pos => {
        return (
            room.getTerrain().get(pos.x, pos.y) !== TERRAIN_MASK_WALL
            && !occupiedPositions.some(occupiedPos => occupiedPos.isEqualTo(pos))
        )
    });
    validGridPositions.forEach(pos => {
        room.visual.text('.', pos.x, pos.y, {color: 'red',backgroundColor:'red',opacity:0.5});
    });

    console.log('gridPositions', validGridPositions.length);
}


const testSpiralPositionsGenerator = () => {

    const room=Game.rooms['E28S12'];
    if(!room) {
        console.log('Room E28S12 not found');
        return;
    }
    const center=room.getPositionAt(25, 25);
    if(!center) {
        console.log('Center not found');
        return;
    }

    
    const spiralPositions:RoomPosition[] = [];
    
    // accept only alternate positions or spiral positions
    let yieldIndex=0;
    const yieldFunction = (pos: RoomPosition) => {
        yieldIndex++;
        if(yieldIndex%2!==0) {
            return false;
        }
        
        spiralPositions.push(pos);
        return spiralPositions.length>=50;
    }
    spiralPositionsGenerator({
        center,
        yieldFunction,
    });
    
    for(const sPos of spiralPositions) {
        room.visual.text('.', sPos.x, sPos.y, {color: 'red',backgroundColor:'red',opacity:0.5});
    }
}

const testScript = () => {
    testSpiralPositionsGenerator();
}



export { 
    testScript 
};