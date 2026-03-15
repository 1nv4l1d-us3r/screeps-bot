type CacheDecorator<I,O> = (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(input:I)=>O>
)=>void;

type CacheDecoratorFactory<I,O> = (
    key: (input: I) => string
)=>CacheDecorator<I,O>;



export const TickCache = <I,O>(key:(input:I)=>string):CacheDecorator<I,O>=>{

    let cacheValue:O|undefined
    let lastCacheKey:string



    const cacheDecorator:CacheDecorator<I,O> = (
        target, 
        propertyKey, 
        descriptor
    )=>{
        const originalMethod=descriptor.value as (input:I)=>O
        const cacheMethod=function(this:any,input:I):O{
            const cacheKey=key(input)+Game.time
            if(cacheKey===lastCacheKey && cacheValue!==undefined) {
                return cacheValue
            }
            cacheValue=originalMethod.call(this,input)
            lastCacheKey=cacheKey
            return cacheValue
        }
        descriptor.value=cacheMethod
    }


    return cacheDecorator


}

/** Cache a zero-arg function per tick. Use this instead of @TickCache for standalone functions. */
export function tickCachedFn<O>(key: string, fn: () => O): () => O {
    let cacheValue: O | undefined
    let lastCacheKey: string
    return () => {
        const cacheKey = key + Game.time
        if (cacheKey === lastCacheKey && cacheValue !== undefined) {
            return cacheValue
        }
        cacheValue = fn()
        lastCacheKey = cacheKey
        return cacheValue
    }
}