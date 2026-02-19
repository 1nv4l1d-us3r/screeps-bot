/**
 * Extend Screeps' global CreepMemory so creep.memory is typed everywhere.
 * No need to cast or use custom Creep & { memory: X } types.
 */

import { WorkerMemory } from "./worker";
import { CustomRoomMemory } from "./room";

declare global {
  interface CreepMemory extends WorkerMemory {

  }
  interface RoomMemory extends CustomRoomMemory {
  }
  interface Memory {
    testScript?: boolean;
  }
}

export {};
