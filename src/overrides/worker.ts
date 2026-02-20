
import { updateFatigueHeatMap } from "../monitoring/fatigue";

declare global {
    interface Creep {
        _moveTo?: typeof Creep.prototype.moveTo;
    }
}

export const overrideWorkerPrototype = () => {
    if (!Creep.prototype._moveTo) {
        Creep.prototype._moveTo = Creep.prototype.moveTo;

        (Creep.prototype.moveTo as any) = function(this: Creep, ...args: any[]) {
            const result = (this as any)._moveTo(...args);
            
            if (this.room.memory.isMonitoringFatigue && result === ERR_TIRED) {
                updateFatigueHeatMap(this.room, this.pos);
            }
            
            return result;
        };
    }
};