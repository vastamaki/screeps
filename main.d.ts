export {};

declare global {
  interface CreepMemory {
    role: string;
    room: Room;
    working: boolean;
    targetId?: string;
  }
}
