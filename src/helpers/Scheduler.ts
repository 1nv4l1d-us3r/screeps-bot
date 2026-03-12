
import { 
    JobType,
    Job,
    RecurringJob,
    OneTimeJob,
    CreateRecurringJobParams,
    CreateRecurringJobsParams,
    CreateOneTimeJobParams,
    CreateOneTimeJobsParams
 } from "../types/scheduler";


class Scheduler {
    public static jobs:Map<number, Job> = new Map();
    public static jobBucketMap: Map<number, number[]> = new Map();
    public static lastJobId:number=0;

    private static createJobId(){
        this.lastJobId++;
        return this.lastJobId;
    }


    private static addJobToQueue(job:Job,existingJobId?:number){
        const now=Game.time

        if(job.triggerTick<now){
            // necessary evil  
            // tick drift can cause job starvation this avoids it
            job.triggerTick=now+5;
            console.log(`[Scheduler][Tick ${now}] Job ${job.name} triggered in the past, rescheduling to ${job.triggerTick}`);
        }

        const jobId=existingJobId??this.createJobId();
        this.jobs.set(jobId,job);

        let jobBucket=this.jobBucketMap.get(job.triggerTick);
        if(jobBucket===undefined) {
            jobBucket=[]
            this.jobBucketMap.set(job.triggerTick,jobBucket);
        }
        jobBucket.push(jobId);
    }



    /*
        Scheduler Main loop to run all the jobs for the current tick
        must be called every tick    
    */
    public static run(){
        const currentTick=Game.time;
        
        for(const [triggerTick,jobBucket] of this.jobBucketMap.entries()){
            if(triggerTick>currentTick){
                continue
            }

            for(const jobId of jobBucket){
                const job=this.jobs.get(jobId);
                if(!job){continue}

                try{
                    console.log(`[Scheduler][Tick ${currentTick}] Running ${job.type} job  ${job.name}`); 
                    job.func();
                }
                catch(err){
                    console.log(`[Scheduler][Tick ${currentTick}] Error running ${job.type} job  ${job.name}`);
                    console.log(err)
                }
                finally{
                    
                    if(job.type===JobType.RECURRING){
                        // update trigger tick for next run
                        job.triggerTick=currentTick+job.interval;
                        this.addJobToQueue(job,jobId);
                    }
                    else{
                        this.jobs.delete(jobId);   
                    }
                }
            }
            this.jobBucketMap.delete(triggerTick);
            // delete the bucket after execution
        }
    }


    public static createOneTimeJob(params:CreateOneTimeJobParams) {
        const {name, delay, func} = params;

        const triggerTick=Game.time+delay;
        const oneTimeJob:OneTimeJob={
            name,
            type:JobType.ONE_TIME,
            triggerTick,
            func,
        }
        this.addJobToQueue(oneTimeJob)
    }

    public static createOneTimeJobs<T>(params:CreateOneTimeJobsParams<T>) {
        const {
            list, 
            nameGenerator, 
            delay, 
            offset=1, 
            func
        } = params;

        list.forEach((item, index) => {
            const jobName = nameGenerator(item, index);
            const delayWithOffset = delay + index*offset;
            this.createOneTimeJob({
                name:jobName,
                delay: delayWithOffset,
                func: () => func(item)
                }
            );
        });
    }
    


    public static createRecurringJob(params:CreateRecurringJobParams) {
        const {name, interval, func} = params;

        const triggerTick=Game.time+interval;
        const recurringJob:RecurringJob={
            name,
            type:JobType.RECURRING,
            triggerTick,
            func,
            interval,
        }

        this.addJobToQueue(recurringJob)
    }



    public static createRecurringJobs<T>(params:CreateRecurringJobsParams<T>) {
        const {
            list, 
            nameGenerator, 
            interval, 
            offset=1, 
            func
        } = params;

        list.forEach((item, index) => {
            const jobName = nameGenerator(item, index);
            const intervalWithOffset = interval + index * offset;
            this.createRecurringJob({
                name:jobName,
                interval: intervalWithOffset,
                func: () => func(item)
                }
            );
        });
    }

}


export { Scheduler };