import type { PlacedBuildingBlock } from '@/types/building-blocks';
import { BUILDING_BLOCKS } from '@/types/building-blocks';
import type { SettingConfig } from '@/components/ContextMenu';

export interface ContextMenuData {
  title: string;
  subtitle?: string;
  settings: SettingConfig[];
}

/**
 * Gets the context menu configuration for a given building block
 * Returns null if the block type doesn't have a context menu configured
 */
export function getContextMenuConfig(block: PlacedBuildingBlock): ContextMenuData | null {
  // Find the building block definition
  const blockDef = BUILDING_BLOCKS.find(b => b.type === block.type);

  if (!blockDef?.contextMenu) {
    return null;
  }

  // Map the settings to include current values from the block
  const settings: SettingConfig[] = blockDef.contextMenu.settings.map(setting => {
    // Safely extract the value from the block
    const blockData = block as unknown as Record<string, unknown>;
    const value = typeof blockData[setting.id] === 'number' ? blockData[setting.id] as number : 0;

    return {
      ...setting,
      value,
    };
  });

  // Get subtitle if configured
  const subtitle = blockDef.contextMenu.getSubtitle?.(block);

  return {
    title: blockDef.contextMenu.title,
    subtitle,
    settings,
  };
}

/**
 * Checks if a building block type has a context menu configured
 */
export function hasContextMenu(block: PlacedBuildingBlock): boolean {
  const blockDef = BUILDING_BLOCKS.find(b => b.type === block.type);
  return !!blockDef?.contextMenu;
}

