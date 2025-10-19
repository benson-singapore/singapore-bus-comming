import { BusStopResponse, BusService } from '@/types/bus';

export async function fetchBusArrivals(stopCode: string): Promise<BusStopResponse> {
  try {
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const response = await fetch(`/api/bus-arrival?code=${stopCode}&t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch bus arrivals: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching bus arrivals:', error);
    throw error;
  }
}

export function formatDuration(durationMs: number): string {
  if (durationMs <= 0) return '到站';
  
  const seconds = Math.floor(durationMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins === 0) {
    return `${secs}秒`;
  }
  return `${mins}分${secs}秒`;
}

export function formatArrivalTime(isoTimeString: string): string {
  try {
    const date = new Date(isoTimeString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('Error formatting arrival time:', error);
    return '';
  }
}

export function getStatusClass(durationMs: number): 'arriving' | 'soon' | 'onway' {
  const seconds = Math.floor(durationMs / 1000);
  if (seconds <= 60) return 'arriving';
  if (seconds <= 180) return 'soon';
  return 'onway';
}

export function getStatusText(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  if (seconds <= 60) return '即将到站';
  if (seconds <= 180) return '快到了';
  return '在路上';
}

export function filterBusByNumber(services: BusService[], busNumbers: string[]): BusService[] {
  return services.filter(service => busNumbers.includes(service.no));
}

