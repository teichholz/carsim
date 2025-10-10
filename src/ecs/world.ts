import { createWorld, addEntity, defineQuery, removeEntity, defineComponent, Types } from 'bitecs';
import type { IWorld } from 'bitecs';

// Define ECS Components using defineComponent
export const Position = defineComponent({
  x: Types.f32,
  y: Types.f32,
});

export const Velocity = defineComponent({
  x: Types.f32,
  y: Types.f32,
});

export const CarComponent = defineComponent({
  speed: Types.f32,
  gridX: Types.f32,
  gridY: Types.f32,
});

export const CarGeneratorComponent = defineComponent({
  frequency: Types.f32,  // cars per tile (when connected tile is free)
  speed: Types.f32,      // tiles per second
  timeSinceLastSpawn: Types.f32,
  gridX: Types.f32,
  gridY: Types.f32,
  direction: Types.ui8, // 0=north, 1=south, 2=east, 3=west
});

// Mapping between direction strings and numbers
export const DirectionMap = {
  north: 0,
  south: 1,
  east: 2,
  west: 3,
} as const;

// Create the ECS world
export let ecsWorld: IWorld;
export const ecsTime = {
  delta: 0,
  elapsed: 0,
  lastTime: performance.now(),
};

// Generator ID tracking (since we can't store strings in ECS)
export const generatorIdMap = new Map<number, string>();

// Define queries
const carGeneratorQuery = defineQuery([CarGeneratorComponent]);
const carQuery = defineQuery([Position, Velocity, CarComponent]);

export const initializeECSWorld = () => {
  ecsWorld = createWorld();
  // Reset time tracking
  ecsTime.delta = 0;
  ecsTime.elapsed = 0;
  ecsTime.lastTime = performance.now();
  return ecsWorld;
};

// Get or create the world
export const getECSWorld = () => {
  if (!ecsWorld) {
    return initializeECSWorld();
  }
  return ecsWorld;
};

// Helper to create a car generator entity
export const createCarGeneratorEntity = (
  id: string,
  gridX: number,
  gridY: number,
  direction: string,
  frequency: number,
  speed: number
) => {
  const world = getECSWorld();
  const eid = addEntity(world);

  // Store the string ID in our map
  generatorIdMap.set(eid, id);

  // Set component properties - bitECS automatically adds the component when you set a property
  CarGeneratorComponent.gridX[eid] = gridX;
  CarGeneratorComponent.gridY[eid] = gridY;
  CarGeneratorComponent.direction[eid] = DirectionMap[direction as keyof typeof DirectionMap];
  CarGeneratorComponent.frequency[eid] = frequency;
  CarGeneratorComponent.speed[eid] = speed;
  CarGeneratorComponent.timeSinceLastSpawn[eid] = 0;

  return eid;
};

// Helper to create a car entity
export const createCarEntity = (
  _generatorId: string,
  x: number,
  y: number,
  gridX: number,
  gridY: number,
  speed: number,
  velocityX: number,
  velocityY: number
) => {
  const world = getECSWorld();
  const eid = addEntity(world);

  // Set component properties
  Position.x[eid] = x;
  Position.y[eid] = y;

  Velocity.x[eid] = velocityX;
  Velocity.y[eid] = velocityY;

  CarComponent.speed[eid] = speed;
  CarComponent.gridX[eid] = gridX;
  CarComponent.gridY[eid] = gridY;

  return eid;
};

// Helper to remove car generator entity by ID
export const removeCarGeneratorEntity = (generatorId: string) => {
  const world = getECSWorld();

  for (const eid of carGeneratorQuery(world)) {
    if (generatorIdMap.get(eid) === generatorId) {
      removeEntity(world, eid);
      generatorIdMap.delete(eid);
      break;
    }
  }
};

// System: Update time
export const timeSystem = () => {
  const now = performance.now();
  const delta = now - ecsTime.lastTime;
  ecsTime.delta = delta / 1000; // Convert to seconds
  ecsTime.elapsed += delta;
  ecsTime.lastTime = now;
};

// System: Car generation
// Note: This is a simplified implementation. Full implementation should check if the
// connected tile is free before spawning. Current implementation uses time-based spawning
// as a placeholder until tile occupancy checking is implemented.
export const carGenerationSystem = (gridSize: number) => {
  const world = getECSWorld();

  for (const eid of carGeneratorQuery(world)) {
    const generator = CarGeneratorComponent;

    // Update time since last spawn
    generator.timeSinceLastSpawn[eid] += ecsTime.delta;

    // TODO: Check if connected tile is free before spawning
    // For now, use time-based spawning as approximation
    const spawnInterval = 1 / generator.frequency[eid]; // seconds per car (placeholder)

    if (generator.timeSinceLastSpawn[eid] >= spawnInterval) {
      generator.timeSinceLastSpawn[eid] = 0;

      // Calculate spawn position and velocity based on direction
      const gridX = generator.gridX[eid];
      const gridY = generator.gridY[eid];
      const direction = generator.direction[eid];
      const speed = generator.speed[eid];

      let x = gridX * gridSize + gridSize / 2;
      let y = gridY * gridSize + gridSize / 2;
      let vx = 0;
      let vy = 0;

      switch (direction) {
        case DirectionMap.north:
          vy = -speed * gridSize; // Moving up
          y += gridSize / 2; // Start at bottom of generator cell
          break;
        case DirectionMap.south:
          vy = speed * gridSize; // Moving down
          y -= gridSize / 2; // Start at top of generator cell
          break;
        case DirectionMap.east:
          vx = speed * gridSize; // Moving right
          x -= gridSize / 2; // Start at left of generator cell
          break;
        case DirectionMap.west:
          vx = -speed * gridSize; // Moving left
          x += gridSize / 2; // Start at right of generator cell
          break;
      }

      // Create the car entity
      const generatorId = generatorIdMap.get(eid) || 'unknown';
      createCarEntity(
        generatorId,
        x,
        y,
        gridX,
        gridY,
        speed,
        vx,
        vy
      );
    }
  }
};

// System: Move cars
export const carMovementSystem = () => {
  const world = getECSWorld();

  for (const eid of carQuery(world)) {
    Position.x[eid] += Velocity.x[eid] * ecsTime.delta;
    Position.y[eid] += Velocity.y[eid] * ecsTime.delta;

    // Update grid position
    // This is a simplified version - in a real implementation, you'd need to get gridSize
    // and handle proper grid coordinate conversion
  }
};

// System: Remove cars that are out of bounds
export const carCleanupSystem = (viewportWidth: number, viewportHeight: number) => {
  const world = getECSWorld();
  const margin = 200; // Extra margin to allow cars to leave the screen

  for (const eid of carQuery(world)) {
    const x = Position.x[eid];
    const y = Position.y[eid];

    if (x < -margin || x > viewportWidth + margin ||
        y < -margin || y > viewportHeight + margin) {
      removeEntity(world, eid);
    }
  }
};

// Main update function to run all systems
export const updateECS = (gridSize: number, viewportWidth: number, viewportHeight: number) => {
  timeSystem();
  carGenerationSystem(gridSize);
  carMovementSystem();
  carCleanupSystem(viewportWidth, viewportHeight);
};

// Get all car entities for rendering
export const getAllCars = () => {
  const world = getECSWorld();
  const cars: Array<{ eid: number; x: number; y: number; speed: number }> = [];

  for (const eid of carQuery(world)) {
    cars.push({
      eid,
      x: Position.x[eid],
      y: Position.y[eid],
      speed: CarComponent.speed[eid],
    });
  }

  return cars;
};
