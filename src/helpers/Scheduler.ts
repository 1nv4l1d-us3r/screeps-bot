
import { 
    JobType,
    Job,
    RecurringJob,
    CreateRecurringJobParams,
    CreateRecurringJobsParams
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
        
        const bucketTriggerTicks=Array.from(this.jobBucketMap.keys());
        bucketTriggerTicks.filter((triggerTick) => triggerTick<=currentTick);


        for(const triggerTick of bucketTriggerTicks){
            const jobBucket=this.jobBucketMap.get(triggerTick);
            if(!jobBucket){
                continue
            }

            for(const jobId of jobBucket){
                const job=this.jobs.get(jobId);
                if(!job){
                    continue
                }
                const jobName=job.name;
                const jobType=job.type;
                try{
                    console.log(`[Scheduler][Tick ${currentTick}] Running ${jobType} job  ${jobName}`); 
                    job.func();
                }
                catch(err){
                    console.log(`[Scheduler][Tick ${currentTick}] Error running ${jobType} job  ${jobName}`);
                    console.log(err)
                }
                finally{
                    
                    if(jobType==JobType.RECURRING){
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