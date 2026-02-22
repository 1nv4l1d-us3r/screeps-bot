
interface ProfileFunctionParams {
    name: string;
    func: () => void;
}


export class CpuProfiler {
    static  profiles: Record<string, number> = {};

    public static log(name: string) {
        const now = Game.cpu.getUsed();
        this.profiles[name] = now;
    }

    public static logEnd(name: string) {
        const startTime = this.profiles[name];
        if(!startTime) {
            console.error(`Profile ${name} not found`);
            return;
        }
        const endTime = Game.cpu.getUsed();
        const cpuUsage = Math.round((endTime - startTime)*100)/100;
        console.log(`CPU Usage [${name}]: ${cpuUsage}`);
        delete this.profiles[name];
    }

   

    public static profileFunction(params: ProfileFunctionParams) {
        const { name, func } = params;
        this.log(name);
        func();
        this.logEnd(name);
    }

}