

const PERMANENT_CACHE_FIND_CONSTANTS=[
    FIND_EXIT_TOP,
    FIND_EXIT_RIGHT,
    FIND_EXIT_BOTTOM,
    FIND_EXIT_LEFT,
    FIND_EXIT,
    FIND_SOURCES,
    FIND_MINERALS
]



const PERMANENT_CACHE_FIND_SET=new Set<FindConstant>(PERMANENT_CACHE_FIND_CONSTANTS);

class RoomCache {
    private static PERMANENT_CACHE: Map<string, any> = new Map();
    private static TEMPORARY_CACHE: Map<string, any> = new Map();
    private static currentTick=-1;


    private static getCacheKey(room: Room, findConstant: FindConstant) {
        return `${room.name}-${findConstant}`;
    }

    private static isPermanentCache(findConstant: FindConstant) {
        return PERMANENT_CACHE_FIND_SET.has(findConstant);
    }

    private static resetTemporaryCache() {
        this.TEMPORARY_CACHE.clear();
        this.currentTick = Game.time;
    }

    private static findInPermanentCache(room: Room, findConstant: FindConstant) {
        const cacheKey = this.getCacheKey(room, findConstant);
        if(this.PERMANENT_CACHE.has(cacheKey)) {
            return this.PERMANENT_CACHE.get(cacheKey);
        }
        const findResult = room.find(findConstant);
        this.PERMANENT_CACHE.set(cacheKey, findResult);
        return findResult;
    }

    private static findInTemporaryCache(room: Room, findConstant: FindConstant) {
        if(this.currentTick !== Game.time) {
            this.resetTemporaryCache();
        }
        const cacheKey = this.getCacheKey(room, findConstant);
        if(this.TEMPORARY_CACHE.has(cacheKey)) {
            return this.TEMPORARY_CACHE.get(cacheKey);
        }
        const findResult = room.find(findConstant);
        this.TEMPORARY_CACHE.set(cacheKey, findResult);
        return findResult;
    }




    public static find(room: Room, findConstant: FindConstant) {
        if(this.isPermanentCache(findConstant)) {
            return this.findInPermanentCache(room, findConstant);
        }
        else {
            return this.findInTemporaryCache(room, findConstant);
        }
    }

}


interface RoomCacheFindParams {
    room: Room;
    findConstant: FindConstant;
    filter?: () => boolean;
}