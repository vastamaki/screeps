export const harvester = (creep: Creep) => {
  const memory = creep.memory;

  if (!memory.state) {
    memory.state = "harvesting";
  }

  if (creep.ticksToLive && creep.ticksToLive < 10) {
    creep.say("💀");
    creep.drop(RESOURCE_ENERGY);
    return;
  }

  if (memory.state === "transferring" && creep.store[RESOURCE_ENERGY] === 0) {
    memory.state = "harvesting";
    memory.targetId = undefined;
  } else if (memory.state === "harvesting" && creep.store.getFreeCapacity() === 0) {
    memory.state = "transferring";
  }

  if (memory.state === "harvesting") {
    harvestEnergy(creep);
  } else {
    transferEnergy(creep);
  }
};

const harvestEnergy = (creep: Creep): void => {
  let source: Source | null = null;

  if (creep.memory.sourceId) {
    source = Game.getObjectById(creep.memory.sourceId);
  }

  if (!source) {
    source = Game.flags["Mine Storage"].pos.findClosestByPath(FIND_SOURCES);
    if (source) {
      creep.memory.sourceId = source.id;
    } else {
      creep.say("❌ No source");
      return;
    }
  }

  const harvestResult = creep.harvest(source);
  if (harvestResult === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, source);
  }
};

const transferEnergy = (creep: Creep): void => {
  if (creep.memory.targetId) {
    const target = Game.getObjectById(creep.memory.targetId);

    if (target && handleTransfer(creep, target as any)) {
      return;
    }
    creep.memory.targetId = undefined;
  }

  const didTransfer = transferToNearbyStorage(creep);

  if (!didTransfer) {
    creep.say("📦 Full");
  }
};

const transferToNearbyStorage = (creep: Creep): boolean => {
  const container = creep.pos.findInRange(FIND_STRUCTURES, 3, {
    filter: (structure) => {
      return structure.structureType === STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    },
  })[0];

  if (!container) return false;

  if (handleTransfer(creep, container)) {
    creep.memory.targetId = container.id;
    return true;
  }
  return false;
};

const handleTransfer = (creep: Creep, target: Creep | AnyStructure): boolean => {
  const transferResult = creep.transfer(target, RESOURCE_ENERGY);

  switch (transferResult) {
    case OK:
      return true;
    case ERR_NOT_IN_RANGE:
      moveToTarget(creep, target);
      return true;
    case ERR_FULL:
    default:
      return false;
  }
};

const moveToTarget = (creep: Creep, target: RoomPosition | _HasRoomPosition): void => {
  creep.moveTo(target, {
    visualizePathStyle: { stroke: "#ffaa00" },
  });
};
