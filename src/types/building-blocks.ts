export interface ContextMenuSettingConfig {
  id: string;
  label: string;
  unit?: string;
  type: 'slider' | 'number';
  min: number;
  max: number;
  step: number;
}

export interface BuildingBlockContextMenuConfig {
  title: string;
  getSubtitle?: (block: PlacedBuildingBlock) => string;
  settings: ContextMenuSettingConfig[];
}

export interface BuildingBlock {
  id: string;
  name: string;
  type: BuildingBlockType;
  icon: string;
  description: string;
  properties?: Record<string, unknown>;
  contextMenu?: BuildingBlockContextMenuConfig;
}

// Base interface for all building block instances placed on the grid
export interface PlacedBuildingBlock {
  id: string;
  type: BuildingBlockType;
  gridX: number;
  gridY: number;
}

// Street-specific interfaces
export interface StreetBlock extends PlacedBuildingBlock {
  type: BuildingBlockType.STREET;
  connections: StreetConnections;
}

export interface StreetConnections {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

// Car Generator-specific interfaces
export enum CarGeneratorDirection {
  NORTH = 'north', // Generates cars going up
  SOUTH = 'south', // Generates cars going down
  EAST = 'east',   // Generates cars going right
  WEST = 'west',   // Generates cars going left
}

export interface CarGeneratorBlock extends PlacedBuildingBlock {
  type: BuildingBlockType.CAR_GENERATOR;
  direction: CarGeneratorDirection;
  frequency: number; // cars per tile (spawn x cars when connected tile is free)
  speed: number;     // tiles per second
}

export enum BuildingBlockType {
  // Street type - single unified type
  STREET = 'street',

  // Other building block types
  ROUNDABOUT = 'roundabout',
  SPEED_LIMIT = 'speed_limit',
  CAR_GENERATOR = 'car_generator',
  TRAFFIC_LIGHT = 'traffic_light',
  STOP_SIGN = 'stop_sign',
}

export const BUILDING_BLOCKS: BuildingBlock[] = [
  {
    id: 'street',
    name: 'Street',
    type: BuildingBlockType.STREET,
    icon: '🛣️',
    description: 'Road segment that adapts to connections',
  },
  {
    id: 'car-generator',
    name: 'Car Generator',
    type: BuildingBlockType.CAR_GENERATOR,
    icon: '🚗',
    description: 'Generates cars at specified frequency',
    properties: {
      frequency: 1, // cars per tile
      speed: 2, // tiles per second
    },
    contextMenu: {
      title: 'Car Generator Settings',
      getSubtitle: (block) => {
        const carGenBlock = block as CarGeneratorBlock;
        return `Direction: ${carGenBlock.direction.toUpperCase()}`;
      },
      settings: [
        {
          id: 'frequency',
          label: 'Frequency',
          unit: 'cars/tile',
          type: 'slider',
          min: 0.1,
          max: 5,
          step: 0.1,
        },
        {
          id: 'speed',
          label: 'Speed',
          unit: 'tiles/second',
          type: 'slider',
          min: 0.5,
          max: 10,
          step: 0.5,
        },
      ],
    },
  },
];