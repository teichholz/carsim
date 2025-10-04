# Car Simulation Refactor Plan

## 🎯 **Goals**
1. Move event handlers from PIXI canvas to window-level events
2. Create global state management for grid properties and simulation state
3. Simplify EquilateralGrid component to focus only on rendering
4. Improve separation of concerns and maintainability

## 📋 **Todo List**

### Phase 1: Global State Management Setup

#### 1.1 Create Global State Store
- [ ] **Create `src/store/simulation-store.ts`**
  - [ ] Define state interface for grid properties (size, scale, resolution, position)
  - [ ] Define state interface for currently selected quadrant
  - [ ] Define state interface for viewport information
  - [ ] Implement state management with Zustand library.
  - [ ] Add persistence integration for relevant state

#### 1.2 Create State Types
- [ ] **Create `src/types/simulation-state.ts`**
  - [ ] Define `GridState` interface (size, scale, resolution, position, showGridLines)
  - [ ] Define `ViewportState` interface (width, height, devicePixelRatio)
  - [ ] Define `SelectedQuadrant` interface (x, y, size, isActive)
  - [ ] Define `SimulationState` interface combining all above

#### 1.3 Create Global State Hooks
- [ ] **Create `src/hooks/useSimulationState.ts`**
  - [ ] `useGridState()` - for grid properties
  - [ ] `useViewportState()` - for viewport information
  - [ ] `useSelectedQuadrant()` - for currently selected quadrant
  - [ ] `useSimulationState()` - combined state access

### Phase 2: Window-Level Event System

#### 2.1 Create Global Event Manager
- [ ] **Create `src/services/event-manager.ts`**
  - [ ] Implement window-level event listeners
  - [ ] Handle wheel events for zooming
  - [ ] Handle mouse events for panning and quadrant selection
  - [ ] Handle keyboard events for shortcuts
  - [ ] Coordinate between canvas position and grid coordinates

#### 2.2 Create Event Handlers
- [ ] **Create `src/hooks/useGlobalEvents.ts`**
  - [ ] `useWheelHandler()` - zoom in/out functionality
  - [ ] `useMouseHandler()` - pan and quadrant selection
  - [ ] `useKeyboardHandler()` - keyboard shortcuts
  - [ ] Coordinate with global state updates

#### 2.3 Create Coordinate Utilities
- [ ] **Create `src/utils/coordinate-conversion.ts`**
  - [ ] Convert screen coordinates to grid coordinates
  - [ ] Convert grid coordinates to screen coordinates
  - [ ] Handle zoom and pan transformations
  - [ ] Calculate visible grid bounds

### Phase 3: Refactor Components

#### 3.1 Simplify EquilateralGrid
- [ ] **Refactor `src/components/EquilateralGrid.tsx`**
  - [ ] Remove all event handling logic
  - [ ] Remove internal state management
  - [ ] Accept props from global state
  - [ ] Focus only on rendering grid lines and highlighted cells
  - [ ] Remove PIXI event system dependency

#### 3.2 Update Main App Component
- [ ] **Refactor `src/app/page.tsx`**
  - [ ] Move grid state to global store
  - [ ] Integrate global event handlers
  - [ ] Remove local state management
  - [ ] Pass only necessary props to components


### Phase 4: Integration and Testing

#### 4.1 Integration
- [ ] **Connect all components to global state**
  - [ ] Ensure EquilateralGrid receives state from global store
  - [ ] Ensure event handlers update global state
  - [ ] Test state persistence across components

## 🏗️ **Architecture Recommendations**

### 1. State Management Approach
**Recommendation: Use Zustand for global state**
- Lightweight and performant
- Great TypeScript support
- Easy to integrate with persistence
- Simple to test and debug

```typescript
// Example structure
interface SimulationStore {
  // Grid state
  gridSize: number;
  gridScale: number;
  gridPosition: { x: number; y: number };
  showGridLines: boolean;

  // Viewport state
  viewportSize: { width: number; height: number };

  // Selection state
  selectedQuadrant: { x: number; y: number } | null;

  // Actions
  setGridSize: (size: number) => void;
  setGridScale: (scale: number) => void;
  setGridPosition: (position: { x: number; y: number }) => void;
  setSelectedQuadrant: (quadrant: { x: number; y: number } | null) => void;
}
```

### 2. Event Handling Architecture
**Recommendation: Centralized event manager with coordinate conversion**

```typescript
// Event flow:
// 1. Window events → Event Manager
// 2. Event Manager → Coordinate conversion
// 3. Coordinate conversion → Global state updates
// 4. Global state updates → Component re-renders
```

### 3. Component Separation
**Recommendation: Clear separation of concerns**

- **EquilateralGrid**: Pure rendering component
- **EventManager**: Handles all user interactions
- **SimulationStore**: Manages all state
- **CoordinateUtils**: Handles coordinate transformations

### 4. Performance Considerations
**Recommendations:**
- Use React.memo for EquilateralGrid to prevent unnecessary re-renders
- Debounce wheel events to prevent excessive updates
- Use requestAnimationFrame for smooth animations
- Implement viewport culling for large grids

## 🔄 **Migration Strategy**

### Step 1: Setup Global State (Non-breaking)
1. Create global state store alongside existing code
2. Gradually move state from components to global store
3. Test each migration step

### Step 2: Create Event System (Non-breaking)
1. Implement window-level event handlers
2. Keep existing PIXI events as fallback
3. Test event handling accuracy

### Step 3: Refactor Components (Breaking changes)
1. Simplify EquilateralGrid component
2. Update all components to use global state
3. Remove old event handling code

### Step 4: Cleanup and Optimization
1. Remove unused code and dependencies
2. Optimize performance
3. Add comprehensive tests

## 📊 **Benefits of This Approach**

1. **Better Separation of Concerns**: Components focus on rendering, not state management
2. **Improved Performance**: Window-level events are more efficient than canvas events
3. **Easier Testing**: Global state and event handlers can be tested independently
4. **Better Maintainability**: Clear architecture makes code easier to understand and modify
5. **Scalability**: Easy to add new components that need access to simulation state
6. **Consistency**: Single source of truth for all simulation state

## ⚠️ **Potential Challenges**

1. **Coordinate Conversion Complexity**: Converting between screen and grid coordinates
2. **Event Timing**: Ensuring events are handled in the correct order
3. **State Synchronization**: Keeping all components in sync with global state
4. **Performance**: Ensuring global state updates don't cause excessive re-renders

## 🎯 **Success Criteria**

- [ ] EquilateralGrid component is simplified and focused only on rendering
- [ ] All event handling is moved to window-level
- [ ] Global state is accessible from any component
- [ ] State persistence works across browser sessions
- [ ] Performance is maintained or improved
- [ ] Code is more maintainable and testable
