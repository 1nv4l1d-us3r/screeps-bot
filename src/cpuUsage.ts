

interface logCpuUsageParams {
    name: string;
    func: () => void;
}

export const logCpuUsage = (params: logCpuUsageParams) => {

    const { name, func } = params;
    
    const cpuUsageStart = Game.cpu.getUsed();
    func();
    const cpuUsageEnd = Game.cpu.getUsed();
    const cpuUsage = Math.round((cpuUsageEnd - cpuUsageStart)*100)/100;
    console.log(`${name} CPU Usage: ${cpuUsage}`);
    return cpuUsage;
}
