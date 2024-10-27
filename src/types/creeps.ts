export type CreepRole = "harvester" | "builder" | "courier";

export type BodyPart = typeof WORK | typeof CARRY | typeof MOVE;

export type CreepConfig = {
  [K in CreepRole]: {
    body: BodyPart[];
    memory: (room: Room) => CreepMemory;
  };
};

export interface CreepCount {
  [key: string]: number;
  harvester: number;
  builder: number;
  courier: number;
}
