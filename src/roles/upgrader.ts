import { collectEnergy, EnergyCollectionMemory } from "../actions/energyCollection";
import { BaseWorker, UpgraderMemory } from "../types/worker";


type  BaseUpgrader = BaseWorker<UpgraderMemory>;


export const upgraderRole = (worker: BaseUpgrader) => {

    const roomController=worker.room.controller
    if(!roomController){
        return 
    }

    const upgradeResult = worker.upgradeController(roomController);

    console.log('upgradeResult', upgradeResult);

    if(upgradeResult==ERR_NOT_IN_RANGE){
        worker.moveTo(roomController)
    }
    if(upgradeResult==ERR_NOT_ENOUGH_RESOURCES){
        worker.memory.isCollectingEnergy=true
    }
    
}