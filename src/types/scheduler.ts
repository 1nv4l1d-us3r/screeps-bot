export type SimpleFunction=() => void;

export enum JobType {
    RECURRING='recurring',
    ONE_TIME='oneTime'
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

export interface OneTimeJob extends BaseJob {
    type:JobType.ONE_TIME;
}



export type Job=RecurringJob|OneTimeJob;




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


export interface CreateOneTimeJobParams {
    name: string;
    delay: number;
    func: () => void
}
export interface CreateOneTimeJobsParams<T> {
    list:T[];
    nameGenerator: (item:T,index:number) => string;
    delay: number;
    offset?: number;
    func: (item:T) => void
}