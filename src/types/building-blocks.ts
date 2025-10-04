export interface BuildingBlock {
  id: string;
  name: string;
  type: BuildingBlockType;
  icon: string;
  description: string;
  properties?: Record<string, unknown>;
}

// Base interface for all building block instances placed on the grid
export interface PlacedBuildingBlock {
  id: string;
  type: BuildingBlockType;
  gridX: number;
  gridY: number;
  properties?: Record<string, unknown>;
}

// Street-specific interfaces
export interface StreetBlock extends PlacedBuildingBlock {
  type: BuildingBlockType.STREET_HORIZONTAL | BuildingBlockType.STREET_VERTICAL | BuildingBlockType.STREET_CURVE | BuildingBlockType.STREET_LONELY;
  streetType: StreetType;
  connections: StreetConnections;
}

export enum StreetType {
  LONELY = 'lonely',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CURVE_TOP_LEFT = 'curve_top_left',
  CURVE_TOP_RIGHT = 'curve_top_right',
  CURVE_BOTTOM_LEFT = 'curve_bottom_left',
  CURVE_BOTTOM_RIGHT = 'curve_bottom_right',
}

export interface StreetConnections {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export enum BuildingBlockType {
  STREET_HORIZONTAL = 'street_horizontal',
  STREET_VERTICAL = 'street_vertical',
  STREET_CURVE = 'street_curve',
  STREET_LONELY = 'street_lonely',
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
    type: BuildingBlockType.STREET_HORIZONTAL,
    icon: '🛣️',
    description: 'Road segment that adapts to connections',
  },
  {
    id: 'roundabout',
    name: 'Roundabout',
    type: BuildingBlockType.ROUNDABOUT,
    icon: '🔄',
    description: 'Traffic roundabout',
    properties: {
      size: 'medium',
      lanes: 1,
    },
  },
  {
    id: 'speed-limit',
    name: 'Speed Limit',
    type: BuildingBlockType.SPEED_LIMIT,
    icon: '🚧',
    description: 'Speed limit zone',
    properties: {
      speedLimit: 50,
      unit: 'km/h',
    },
  },
  {
    id: 'car-generator',
    name: 'Car Generator',
    type: BuildingBlockType.CAR_GENERATOR,
    icon: '🚗',
    description: 'Generates cars at specified frequency',
    properties: {
      frequency: 1, // cars per second
      speed: 30, // km/h
    },
  },
  {
    id: 'traffic-light',
    name: 'Traffic Light',
    type: BuildingBlockType.TRAFFIC_LIGHT,
    icon: '🚦',
    description: 'Traffic control light',
    properties: {
      cycleTime: 30, // seconds
    },
  },
  {
    id: 'stop-sign',
    name: 'Stop Sign',
    type: BuildingBlockType.STOP_SIGN,
    icon: '🛑',
    description: 'Stop sign for traffic control',
    properties: {
      stopTime: 3, // seconds
    },
  },
];