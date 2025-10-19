import { SavedBusStop } from '@/types/bus';

const STORAGE_KEY = 'bus_stops';
const INIT_KEY = 'bus_stops_initialized';

// Default bus stops to initialize
const DEFAULT_BUS_STOPS = [
  {
    name: 'Home 371',
    code: '67661',
    buses: ['371'],
  },
  {
    name: 'SengKang 371',
    code: '67009',
    buses: ['371'],
  },
];

export const localStorageUtil = {
  // Initialize default bus stops if first time
  initializeDefaultStops(): void {
    if (typeof window === 'undefined') return;
    
    const isInitialized = localStorage.getItem(INIT_KEY);
    if (isInitialized) return; // Already initialized
    
    const existingStops = this.getBusStops();
    if (existingStops.length > 0) {
      // User already has stops, mark as initialized
      localStorage.setItem(INIT_KEY, 'true');
      return;
    }
    
    // Add default stops
    DEFAULT_BUS_STOPS.forEach((stop, index) => {
      const newStop: SavedBusStop = {
        id: `default-${Date.now()}-${index}`,
        name: stop.name,
        code: stop.code,
        buses: stop.buses,
        sortOrder: index,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      existingStops.push(newStop);
    });
    
    this.saveBusStops(existingStops);
    localStorage.setItem(INIT_KEY, 'true');
  },

  // Get all saved bus stops (sorted by sortOrder)
  getBusStops(): SavedBusStop[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const stops = data ? JSON.parse(data) : [];
      
      // Ensure all stops have sortOrder
      const stopsWithOrder = stops.map((stop: SavedBusStop, index: number) => ({
        ...stop,
        sortOrder: stop.sortOrder !== undefined ? stop.sortOrder : index,
      }));
      
      // Sort by sortOrder
      return stopsWithOrder.sort((a: SavedBusStop, b: SavedBusStop) => a.sortOrder - b.sortOrder);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Save all bus stops
  saveBusStops(stops: SavedBusStop[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stops));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  // Add a new bus stop
  addBusStop(stop: Omit<SavedBusStop, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>): SavedBusStop {
    const stops = this.getBusStops();
    const maxSortOrder = stops.length > 0 ? Math.max(...stops.map(s => s.sortOrder)) : -1;
    
    const newStop: SavedBusStop = {
      ...stop,
      id: Date.now().toString(),
      sortOrder: maxSortOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    stops.push(newStop);
    this.saveBusStops(stops);
    return newStop;
  },

  // Update an existing bus stop
  updateBusStop(id: string, updates: Partial<Omit<SavedBusStop, 'id' | 'createdAt'>>): SavedBusStop | null {
    const stops = this.getBusStops();
    const index = stops.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    stops[index] = {
      ...stops[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveBusStops(stops);
    return stops[index];
  },

  // Delete a bus stop
  deleteBusStop(id: string): boolean {
    const stops = this.getBusStops();
    const filtered = stops.filter(s => s.id !== id);
    if (filtered.length === stops.length) return false;
    this.saveBusStops(filtered);
    return true;
  },

  // Get a single bus stop by ID
  getBusStopById(id: string): SavedBusStop | null {
    const stops = this.getBusStops();
    return stops.find(s => s.id === id) || null;
  },

  // Move a bus stop up in the list
  moveStopUp(id: string): boolean {
    const stops = this.getBusStops();
    const index = stops.findIndex(s => s.id === id);
    
    if (index <= 0) return false; // Already at top or not found
    
    // Swap sortOrder with previous item
    const temp = stops[index].sortOrder;
    stops[index].sortOrder = stops[index - 1].sortOrder;
    stops[index - 1].sortOrder = temp;
    
    this.saveBusStops(stops);
    return true;
  },

  // Move a bus stop down in the list
  moveStopDown(id: string): boolean {
    const stops = this.getBusStops();
    const index = stops.findIndex(s => s.id === id);
    
    if (index === -1 || index >= stops.length - 1) return false; // At bottom or not found
    
    // Swap sortOrder with next item
    const temp = stops[index].sortOrder;
    stops[index].sortOrder = stops[index + 1].sortOrder;
    stops[index + 1].sortOrder = temp;
    
    this.saveBusStops(stops);
    return true;
  },

  // Reorder stops (for batch operations)
  reorderStops(orderedIds: string[]): void {
    const stops = this.getBusStops();
    const stopsMap = new Map(stops.map(s => [s.id, s]));
    
    orderedIds.forEach((id, index) => {
      const stop = stopsMap.get(id);
      if (stop) {
        stop.sortOrder = index;
      }
    });
    
    this.saveBusStops(stops);
  },
};

