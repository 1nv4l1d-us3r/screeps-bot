// import { CacheProvider } from "../cache/cacheProvider";




const ENERGY_CONSUMER_STRUCTURE_SET=new Set<StructureConstant>([
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
    STRUCTURE_CONTAINER,
])

const ENERGY_CONSUMER_STRUCTURE_PRIORITY:Partial<Record<StructureConstant, number>>={
    [STRUCTURE_SPAWN]: 1,
    [STRUCTURE_EXTENSION]: 2,
    [STRUCTURE_TOWER]: 3,
    [STRUCTURE_CONTAINER]: 4,
}

const getEnergyConsumerPriority = (structure: Structure) => {
    return ENERGY_CONSUMER_STRUCTURE_PRIORITY[structure.structureType] || Infinity;
}



const findRoomEnergyConsumers = (room: Room) => {

    const roomStructures = room.find(FIND_STRUCTURES);
    // TODO: use cache provider to cache the room structures

    const energyConsumers = roomStructures
        .filter(
            structure => ENERGY_CONSUMER_STRUCTURE_SET.has(structure.structureType)
        )
        .sort(
            (a, b) => getEnergyConsumerPriority(a) - getEnergyConsumerPriority(b)
        )
    return energyConsumers;
}


const findRoomEnergyProviders = (room: Room) => {
    const roomStructures = room.find(FIND_STRUCTURES);

    const spawns:StructureSpawn[]=[]
    const containers:StructureContainer[]=[]
    const storage=room.storage
    // const links=[]
    // TODO: add links to the list
    
    roomStructures.forEach(structure => {
        if(structure.structureType === STRUCTURE_SPAWN) {
            spawns.push(structure);
        }
        else if(structure.structureType === STRUCTURE_CONTAINER) {
            containers.push(structure);
        }
    });

   if(!containers.length && !storage) {
    return spawns;
   }

   const providers:(StructureContainer|StructureStorage)[]=[];

   if(storage) {
    providers.push(storage);
   }
   providers.push(...containers);

   return providers;
}