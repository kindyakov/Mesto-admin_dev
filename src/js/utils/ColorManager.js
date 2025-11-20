/**
 * ColorManager Utility
 * Centralized color management for consistent chart colors across the application
 */
class ColorManager {
  // Predefined color palette for warehouses
  static PALETTE = [
    '#5782A1', // Blue-gray
    '#E3AA39', // Orange/gold
    '#19D06D', // Green
    '#E03D3D', // Red
    '#EFBB34', // Yellow
    '#9B59B6', // Purple
    '#3498DB', // Light blue
    '#E67E22', // Dark orange
    '#1ABC9C', // Turquoise
    '#34495E', // Dark gray
    '#E74C3C', // Bright red
    '#F39C12', // Orange
    '#27AE60', // Emerald
    '#8E44AD', // Dark purple
    '#2980B9', // Strong blue
    '#F1C40F', // Bright yellow
    '#16A085', // Dark turquoise
    '#2C3E50', // Midnight blue
    '#C0392B', // Dark red
    '#D35400', // Pumpkin orange
  ];

  // Default colors for different states
  static COLORS = {
    DEFAULT_BAR: '#5782a1', // Default bar color (unselected)
    EMPTY_CHART: '#d1d5db',  // Gray for empty doughnut chart
    BACKGROUND: '#ffffff',   // White background
    BORDER: '#ffffff',       // White border for segments
  };

  /**
   * Get consistent color for a warehouse based on its ID
   * @param {number} warehouseId - The warehouse ID
   * @returns {string} Color hex code
   */
  static getWarehouseColor(warehouseId) {
    if (warehouseId === null || warehouseId === undefined) {
      return this.COLORS.DEFAULT_BAR;
    }

    const colorIndex = Math.abs(warehouseId) % this.PALETTE.length;
    return this.PALETTE[colorIndex];
  }

  /**
   * Get color for a bar based on selection state and warehouse
   * @param {boolean} isSelected - Whether the bar is selected
   * @param {number} warehouseId - The warehouse ID
   * @returns {string} Color hex code
   */
  static getBarColor(isSelected, warehouseId) {
    if (isSelected && warehouseId !== null && warehouseId !== undefined) {
      return this.getWarehouseColor(warehouseId);
    }
    return this.COLORS.DEFAULT_BAR;
  }

  /**
   * Get colors array for multiple warehouses
   * @param {Array} warehouseIds - Array of warehouse IDs
   * @returns {Array} Array of color hex codes
   */
  static getWarehouseColors(warehouseIds) {
    return warehouseIds.map(id => this.getWarehouseColor(id));
  }

  /**
   * Get color palette subset for chart segments
   * @param {number} count - Number of colors needed
   * @returns {Array} Array of color hex codes
   */
  static getColorPalette(count) {
    return this.PALETTE.slice(0, Math.min(count, this.PALETTE.length));
  }

  /**
   * Create color mapping for selected warehouses
   * @param {Map} warehouseMap - Map of warehouse data with revenue
   * @returns {Object} Object with labels, data, and colors arrays
   */
  static createWarehouseColorMapping(warehouseMap) {
    const warehouses = Array.from(warehouseMap.values());

    // Sort by revenue descending for better visualization
    warehouses.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

    const labels = warehouses.map(w => w.warehouse_short_name || `WH${w.warehouse_id}`);
    const data = warehouses.map(w => w.revenue || 0);
    const colors = warehouses.map(w => this.getWarehouseColor(w.warehouse_id));

    return { labels, data, colors };
  }

  /**
   * Check if a color is light for text contrast
   * @param {string} hexColor - Color hex code
   * @returns {boolean} True if color is light
   */
  static isColorLight(hexColor) {
    if (!hexColor || !hexColor.startsWith('#')) return false;

    const hex = hexColor.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  }
}

export default ColorManager;