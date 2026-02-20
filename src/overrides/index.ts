import { overrideWorkerPrototype } from "./worker";

export const initializeOverrides = () => {
    overrideWorkerPrototype();
};
