# Context Menu API Documentation

## Overview
The `ContextMenu` component is a generalized, reusable component for displaying configurable settings menus for building blocks. It supports both slider and number input controls with customizable ranges, steps, and units.

## API Reference

### ContextMenu Component

```typescript
import ContextMenu, { type SettingConfig } from "@/components/ContextMenu";
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `x` | `number` | X position of the menu (in pixels) |
| `y` | `number` | Y position of the menu (in pixels) |
| `title` | `string` | Main title displayed in the header |
| `subtitle` | `string?` | Optional subtitle displayed below the title |
| `settings` | `SettingConfig[]` | Array of setting configurations |
| `onSettingChange` | `(id: string, value: number) => void` | Callback when a setting value changes |
| `onClose` | `() => void` | Callback when the menu should close |

### SettingConfig Interface

```typescript
interface SettingConfig {
  id: string;           // Unique identifier for the setting
  label: string;        // Display label for the setting
  value: number;        // Current value
  unit?: string;        // Optional unit of measurement (e.g., "cars/second")
  type: 'slider' | 'number';  // Type of input control
  min: number;          // Minimum allowed value
  max: number;          // Maximum allowed value
  step: number;         // Step/increment size
}
```

## Usage Examples

### Example 1: Car Generator Settings (Sliders)

```typescript
const settings: SettingConfig[] = [
  {
    id: 'frequency',
    label: 'Frequency',
    value: 1.5,
    unit: 'cars/tile',
    type: 'slider',
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  {
    id: 'speed',
    label: 'Speed',
    value: 2.0,
    unit: 'tiles/second',
    type: 'slider',
    min: 0.5,
    max: 10,
    step: 0.5,
  },
];

<ContextMenu
  x={mouseX}
  y={mouseY}
  title="Car Generator Settings"
  subtitle="Direction: NORTH"
  settings={settings}
  onSettingChange={(id, value) => {
    console.log(`Setting ${id} changed to ${value}`);
    // Update your building block here
  }}
  onClose={() => setMenuOpen(false)}
/>
```

### Example 2: Speed Limit Settings (Number Input)

```typescript
const settings: SettingConfig[] = [
  {
    id: 'speedLimit',
    label: 'Speed Limit',
    value: 60,
    unit: 'km/h',
    type: 'number',
    min: 10,
    max: 200,
    step: 5,
  },
];

<ContextMenu
  x={mouseX}
  y={mouseY}
  title="Speed Limit Settings"
  settings={settings}
  onSettingChange={(id, value) => {
    updateSpeedLimit(value);
  }}
  onClose={() => setMenuOpen(false)}
/>
```

### Example 3: Traffic Light Settings (Mixed)

```typescript
const settings: SettingConfig[] = [
  {
    id: 'greenDuration',
    label: 'Green Light Duration',
    value: 30,
    unit: 'seconds',
    type: 'slider',
    min: 10,
    max: 120,
    step: 5,
  },
  {
    id: 'yellowDuration',
    label: 'Yellow Light Duration',
    value: 3,
    unit: 'seconds',
    type: 'number',
    min: 1,
    max: 10,
    step: 1,
  },
  {
    id: 'redDuration',
    label: 'Red Light Duration',
    value: 25,
    unit: 'seconds',
    type: 'slider',
    min: 10,
    max: 120,
    step: 5,
  },
];

<ContextMenu
  x={mouseX}
  y={mouseY}
  title="Traffic Light Settings"
  subtitle="Intersection Control"
  settings={settings}
  onSettingChange={(id, value) => {
    updateTrafficLightTiming(id, value);
  }}
  onClose={() => setMenuOpen(false)}
/>
```

## Features

### 1. Input Types

#### Slider (`type: 'slider'`)
- Visual range slider for continuous values
- Shows current value with appropriate decimal places
- Best for values with a defined range where users want to explore different values

#### Number Input (`type: 'number'`)
- Direct numeric input field
- Enforces min/max constraints
- Best for precise value entry or when users know the exact value they want

### 2. Units
- Optional unit labels display next to values
- For sliders: shown as read-only text after the value
- For number inputs: shown as a label to the right of the input field

### 3. Automatic Decimal Formatting
- The component automatically determines decimal places based on the `step` value
- `step: 0.1` → displays 1 decimal place (e.g., "2.5")
- `step: 0.01` → displays 2 decimal places (e.g., "2.53")
- `step: 1` → displays no decimal places (e.g., "25")

### 4. Interaction Features
- **Outside Click**: Menu closes when clicking outside
- **ESC Key**: Menu closes when pressing Escape
- **Smooth Animations**: Fade and scale animations on open/close
- **Real-time Updates**: Values update immediately as sliders move or numbers are entered

## Styling

The component uses Tailwind CSS with dark mode support:
- Light theme: White background with gray borders
- Dark theme: Dark gray background with lighter borders
- Gradient header (blue to purple)
- Hover states on all interactive elements

## Integration Pattern

### Step 1: Define Settings Configuration
Create a function that generates settings based on your building block type:

```typescript
function getSettingsForBlock(block: PlacedBuildingBlock): SettingConfig[] {
  switch (block.type) {
    case BuildingBlockType.CAR_GENERATOR:
      return [
        { id: 'frequency', label: 'Frequency', value: block.frequency, ... },
        { id: 'speed', label: 'Speed', value: block.speed, ... },
      ];
    case BuildingBlockType.SPEED_LIMIT:
      return [
        { id: 'limit', label: 'Speed Limit', value: block.limit, ... },
      ];
    // Add more cases for other block types
  }
}
```

### Step 2: Handle Setting Changes
Implement a generic handler that updates the correct property:

```typescript
const handleSettingChange = useCallback((id: string, value: number) => {
  if (!contextMenu) return;

  const updatedBlock = {
    ...contextMenu.block,
    [id]: value,  // Dynamically update the property
  };

  // Update in your state management system
  updateBlock(updatedBlock);

  // Update context menu state
  setContextMenu({ ...contextMenu, block: updatedBlock });
}, [contextMenu]);
```

### Step 3: Render Context Menu
```typescript
{contextMenu && (
  <ContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    title={getTitle(contextMenu.block)}
    subtitle={getSubtitle(contextMenu.block)}
    settings={getSettingsForBlock(contextMenu.block)}
    onSettingChange={handleSettingChange}
    onClose={() => setContextMenu(null)}
  />
)}
```

## Best Practices

1. **Use Sliders for Ranges**: When users should explore different values within a range
2. **Use Number Inputs for Precision**: When users need to enter exact values
3. **Choose Appropriate Steps**:
   - Small steps (0.1, 0.01) for fine-grained control
   - Larger steps (1, 5, 10) for coarser adjustments
4. **Add Units**: Always include units when the value represents a measurement
5. **Meaningful Labels**: Use clear, descriptive labels that users can understand
6. **Reasonable Ranges**: Set min/max values that make sense for your use case

## Extending the Component

To add new input types in the future:

1. Add the new type to the `SettingConfig` interface:
   ```typescript
   type: 'slider' | 'number' | 'toggle' | 'select';
   ```

2. Implement the rendering logic in `renderSetting()`:
   ```typescript
   if (setting.type === 'toggle') {
     return <ToggleSwitch ... />;
   }
   ```

3. Add any additional configuration properties needed for the new type

## Accessibility

The component includes several accessibility features:
- Proper label associations using `htmlFor` and `id`
- Keyboard navigation support (ESC to close)
- Clear visual feedback on focus states
- Semantic HTML structure

## Performance

- Uses `useCallback` for event handlers to prevent unnecessary re-renders
- Local state management for immediate UI feedback
- Memoization of values where appropriate
- Efficient event listener cleanup on unmount

