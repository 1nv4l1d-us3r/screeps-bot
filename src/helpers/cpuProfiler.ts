interface ProfileFunctionParams {
    name: string;
    func: () => void;
}

export class CpuProfiler {
    static profiles: Record<string, number> = {};
    static currentTick: number = -1;

    private static resetProfiles() {
        this.profiles = {};
        this.currentTick = Game.time;
    }

    public static log(name: string) {
        if (this.currentTick !== Game.time) {
            this.resetProfiles();
        }

        if (name in this.profiles) {
            console.error(`Profile ${name} already exists, skipping`);
            return;
        }

        const currentCpuUsage = Game.cpu.getUsed();
        this.profiles[name] = currentCpuUsage;
    }

    public static logEnd(name: string) {
        const startCpuUsage = this.profiles[name];

        if (startCpuUsage === undefined) {
            console.error(`Profile ${name} not found`);
            return;
        }

        const cpuUsage = Game.cpu.getUsed() - startCpuUsage;
        console.log(`CPU Usage [${name}]: ${cpuUsage.toFixed(2)}`);

        delete this.profiles[name];
    }

    public static profileFunction({ name, func }: ProfileFunctionParams) {
        this.log(name);
        func();
        this.logEnd(name);
    }
}