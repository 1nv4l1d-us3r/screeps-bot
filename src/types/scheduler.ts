export type SimpleFunction=() => void;

export enum JobType {
    RECURRING='recurring',
    // ONE_TIME
}


export interface BaseJob {
    name:string;
    type:JobType;
    triggerTick:number;
    func:SimpleFunction;
}

export interface RecurringJob extends BaseJob {
    type:JobType.RECURRING;
    interval:number;
}



export type Job=RecurringJob;




export interface CreateRecurringJobParams {
    name: string;
    interval: number;
    func: () => void
}

export interface CreateRecurringJobsParams<T> {
    list:T[];
    nameGenerator: (item:T,index:number) => string;
    interval: number;
    offset?: number;
    func: (item:T) => void
}
