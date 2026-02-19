
// -------------- Energy Collection --------------//
export interface EnergyCollectionMemory{
    isCollectingEnergy?:boolean;

    energyStorageStructureId?: Id<StructureContainer>;
    energyDroppedResourceId?: Id<Resource>;
}


// -------------- Resource Mining --------------//
export interface ResourceMiningMemory{
    isMiningResource?:boolean;
    
    miningResourceId?: Id<Source|Mineral>;
}