// global way of test Scripts execution
import { findCenter } from "./grid/utils";
import { getBestTowerConstructionPosition } from './roomDesign/towers';

const testScript = () => {

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



export { 
    testScript 
};