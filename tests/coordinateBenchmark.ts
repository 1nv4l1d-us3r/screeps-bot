import { CpuProfiler } from "../src/helpers/cpuProfiler";


const SIZE = 50;
const ITERATIONS = 3000;
const ROOM = "E28S12";

export const testCoordinateFormats = () => {

  // 🔢 Packed number keys
  CpuProfiler.profileFunction({
    name: "Packed numeric key (x*50+y)",
    func: () => {
      const map = new Map<number, number>();
      for (let i = 0; i < ITERATIONS; i++) {
        const x = i % SIZE;
        const y = (i * 7) % SIZE;
        const key = x * SIZE + y;
        map.set(key, i);
      }
    }
  });

  // 🧵 String keys
  CpuProfiler.profileFunction({
    name: "String key 'x,y'",
    func: () => {
      const map = new Map<string, number>();
      for (let i = 0; i < ITERATIONS; i++) {
        const x = i % SIZE;
        const y = (i * 7) % SIZE;
        const key = `${x},${y}`;
        map.set(key, i);
      }
    }
  });

  // 📍 RoomPosition objects
  CpuProfiler.profileFunction({
    name: "RoomPosition objects",
    func: () => {
      const map = new Map<RoomPosition, number>();
      for (let i = 0; i < ITERATIONS; i++) {
        const x = i % SIZE;
        const y = (i * 7) % SIZE;
        const pos = new RoomPosition(x, y, ROOM);
        map.set(pos, i);
      }
    }
  });

  // 📦 Plain objects
  CpuProfiler.profileFunction({
    name: "{x,y} object keys",
    func: () => {
      const arr: {x:number,y:number}[] = [];
      for (let i = 0; i < ITERATIONS; i++) {
        const x = i % SIZE;
        const y = (i * 7) % SIZE;
        arr.push({ x, y });
      }
    }
  });

  // 🚀 Typed array (baseline fastest)
  CpuProfiler.profileFunction({
    name: "Typed array index",
    func: () => {
      const grid = new Uint8Array(SIZE * SIZE);
      for (let i = 0; i < ITERATIONS; i++) {
        const x = i % SIZE;
        const y = (i * 7) % SIZE;
        const key = x * SIZE + y;
        grid[key] = 1;
      }
    }
  });

};