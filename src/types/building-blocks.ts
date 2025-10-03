export interface BuildingBlock {
  id: string;
  name: string;
  type: BuildingBlockType;
  icon: string;
  description: string;
  properties?: Record<string, unknown>;
}

export enum BuildingBlockType {
  STREET_HORIZONTAL = 'street_horizontal',
  STREET_VERTICAL = 'street_vertical',
  STREET_CURVE = 'street_curve',
  ROUNDABOUT = 'roundabout',
  SPEED_LIMIT = 'speed_limit',
  CAR_GENERATOR = 'car_generator',
  TRAFFIC_LIGHT = 'traffic_light',
  STOP_SIGN = 'stop_sign',
}

export const BUILDING_BLOCKS: BuildingBlock[] = [
  {
    id: 'street-h',
    name: 'Street',
    type: BuildingBlockType.STREET_HORIZONTAL,
    icon: '🛣️',
    description: 'Road segment',
  },
//   {
//     id: 'street-v',
//     name: 'Vertical Street',
//     type: BuildingBlockType.STREET_VERTICAL,
//     icon: '🛣️',
//     description: 'Vertical road segment',
//     properties: {
//       direction: 'vertical',
//       lanes: 2,
//     },
//   },
//   {
//     id: 'street-curve',
//     name: 'Curved Street',
//     type: BuildingBlockType.STREET_CURVE,
//     icon: '🛣️',
//     description: 'Curved road segment',
//     properties: {
//       curveType: 'smooth',
//       lanes: 2,
//     },
//   },
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
