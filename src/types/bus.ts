// Bus arrival data types based on the API response
export interface BusArrivalInfo {
  time: string;
  duration_ms: number;
  lat: number;
  lng: number;
  load: string;
  feature: string;
  type: string;
  visit_number: number;
  origin_code: string;
  destination_code: string;
  monitored: number;
}

export interface BusService {
  no: string;
  operator: string;
  next: BusArrivalInfo;
  subsequent: BusArrivalInfo;
  next2: BusArrivalInfo;
  next3: BusArrivalInfo;
}

export interface BusStopResponse {
  services: BusService[];
}

// User saved bus stop configuration
export interface SavedBusStop {
  id: string;
  code: string; // Bus stop code
  name: string; // Custom name for the bus stop
  buses: string[]; // Array of bus numbers to monitor (e.g., ["371", "5"])
  sortOrder: number; // Sort order for display (lower number appears first)
  createdAt: number;
  updatedAt: number;
}

// Processed bus data for display
export interface BusArrival {
  busNumber: string;
  stopCode: string;
  stopName: string;
  arrivals: {
    label: string;
    durationMs: number;
    time: string;
    monitored: number;
  }[];
}

