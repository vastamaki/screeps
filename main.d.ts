export {};

declare global {
  interface CreepMemory {
    role: string;
    room: Room;
    working: boolean;
    sourceId?: string;
    targetId?: string;
    state?: string;
  }
}
