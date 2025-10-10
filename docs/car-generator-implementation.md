# Car Generator Implementation

## Overview
This document describes the implementation of the car generator building block for the 2D car simulation.

## Features Implemented

### 1. Car Generator Building Block
- **Location**: `src/types/building-blocks.ts`
- Added `CarGeneratorDirection` enum with four directions: NORTH, SOUTH, EAST, WEST
- Added `CarGeneratorBlock` interface extending `PlacedBuildingBlock`
- Properties:
  - `direction`: The direction cars will be generated (automatically determined by adjacent streets)
  - `frequency`: Cars per tile - spawns x cars when the connected tile is free (default: 1.0)
  - `speed`: Tiles per second (default: 2.0)

### 2. Car Generator Component
- **Location**: `src/components/building-blocks/CarGenerator.tsx`
- Renders the appropriate sprite based on the generator's direction
- Sprites used:
  - `Car Gen N.png` - Generates cars going north (up)
  - `Car Gen S.png` - Generates cars going south (down)
  - `Car Gen E.png` - Generates cars going east (right)
  - `Car Gen W.png` - Generates cars going west (left)

### 3. Placement Validation
- **Location**: `src/utils/car-generator-utils.ts`
- Functions:
  - `canPlaceCarGenerator()`: Validates that a car generator can only be placed adjacent to a street
  - `determineCarGeneratorDirection()`: Automatically determines the direction based on which side has a street
  - `createCarGeneratorBlock()`: Creates a new car generator block with proper validation
- Placement rules:
  - Street below → Generates cars going NORTH
  - Street above → Generates cars going SOUTH
  - Street to the left → Generates cars going EAST
  - Street to the right → Generates cars going WEST

### 4. BitECS Integration
- **Location**: `src/ecs/world.ts`
- Implemented a complete Entity Component System using bitECS
- Components:
  - `Position`: x, y coordinates for cars
  - `Velocity`: x, y velocity for car movement
  - `CarComponent`: Car-specific data (speed, grid position)
  - `CarGeneratorComponent`: Generator-specific data (frequency, speed, direction, spawn timing)
- Systems:
  - `timeSystem()`: Tracks delta time for smooth updates
  - `carGenerationSystem()`: Spawns cars at the specified frequency
  - `carMovementSystem()`: Updates car positions based on velocity
  - `carCleanupSystem()`: Removes cars that leave the viewport
- The ECS runs in a requestAnimationFrame loop when the simulation is running

### 5. Context Menu
- **Location**: `src/components/ContextMenu.tsx`
- Right-click on a car generator to open configuration menu
- Features:
  - Adjust frequency (0.1 - 5.0 cars/second) with slider
  - Adjust speed (0.5 - 10.0 tiles/second) with slider
  - Delete generator button
  - Shows current direction
  - Modern UI with smooth animations
- Closes on outside click or ESC key

### 6. Right-Click Handling
- **Location**: `src/app/page.tsx`
- Prevents default browser context menu globally
- Detects right-clicks on car generators
- Opens custom context menu at click position
- Integrates with the simulation store for updates

### 7. Integration with Main Page
- **Location**: `src/app/page.tsx`
- Loads car generator sprite assets on startup
- Handles car generator placement with validation
- Creates ECS entities when car generators are placed
- Removes ECS entities when car generators are deleted
- Updates ECS on every frame when simulation is running
- Context menu handlers for updating generator properties

## Usage

### Placing a Car Generator
1. Select "Car Generator" from the inventory
2. Click on a grid cell **adjacent to a street**
3. The generator will automatically orient based on the street position
4. If placement is invalid (not next to a street), a console warning appears

### Configuring a Car Generator
1. Right-click on an existing car generator
2. Use the sliders to adjust:
   - **Frequency**: How many cars spawn per tile when the connected tile is free (cars per tile)
   - **Speed**: How fast the cars move (tiles per second)
3. Click outside the menu or press ESC to close

### Running the Simulation
1. Start the simulation using the "Start" button in the grid controls
2. Car generators will begin spawning cars at the configured frequency
3. Cars will move in the direction determined by the generator
4. Cars are automatically cleaned up when they leave the screen

## Technical Details

### Car Generation Logic
- Cars spawn at the generator's position when the connected tile is free
- Frequency determines how many cars spawn per free tile (cars/tile)
- Initial velocity is calculated based on direction:
  - NORTH: negative Y velocity (moving up)
  - SOUTH: positive Y velocity (moving down)
  - EAST: positive X velocity (moving right)
  - WEST: negative X velocity (moving left)
- **Current Implementation Note**: The system currently uses time-based spawning as a placeholder until tile occupancy checking is fully implemented
- Each generator tracks time since last spawn independently

### ECS Architecture
- Uses bitECS 0.3.40 for efficient entity management
- Separates data (components) from logic (systems)
- Scalable architecture that can handle thousands of cars
- Components use TypedArrays for memory efficiency

### Performance Considerations
- Cars are removed when they leave the viewport (with 200px margin)
- ECS systems run only when simulation is active
- Component data is stored in contiguous memory for cache efficiency
- Query results are cached by bitECS

## Future Enhancements

### Potential Improvements
1. **Tile Occupancy Checking**: Implement proper tile-based spawning logic (check if connected tile is free)
2. **Car Rendering**: Add actual car sprites/circles instead of just position data
3. **Car Following**: Implement logic for cars to follow streets
4. **Collision Detection**: Prevent cars from overlapping
5. **Traffic Rules**: Add speed limits, stop signs, traffic lights
6. **Car Colors**: Add variety to car appearance
7. **Statistics**: Track number of cars generated, average speed, etc.
8. **Save/Load**: Persist generator configurations
9. **Batch Editing**: Select multiple generators and edit at once

### Architecture Notes
- The `getAllCars()` function is available for rendering cars in the future
- The ECS world is designed to be extended with additional components and systems
- Generator entities can be updated dynamically (though this isn't fully implemented yet)
- The context menu component can be extended with more configuration options

## Files Modified/Created

### New Files
- `src/ecs/world.ts` - Complete ECS implementation
- `src/components/building-blocks/CarGenerator.tsx` - Car generator component
- `src/utils/car-generator-utils.ts` - Placement validation utilities
- `src/components/ContextMenu.tsx` - Right-click configuration menu
- `docs/car-generator-implementation.md` - This document

### Modified Files
- `src/types/building-blocks.ts` - Added car generator types
- `src/components/building-blocks/BuildingBlockRenderer.tsx` - Added car generator rendering
- `src/app/page.tsx` - Integrated car generators, ECS, and context menu

