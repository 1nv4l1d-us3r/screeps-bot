// global way of test Scripts execution
import { CpuProfiler } from "./cpuProfiler";




export const testScriptRunner = () => {
    const testScriptName=Memory.testScript;
    if(!testScriptName) {
        return;
    }

    const testFunction=testScripts[testScriptName];
    if(!testFunction) {
        return 
    }

    CpuProfiler.profileFunction(
        {
            name: `testScript ${testScriptName} run`, 
            func: testFunction
        }
        
    );
}

const testScripts:Record<string, () => void> = {
}




/*

Memory.testScript='roomDesign'

*/





