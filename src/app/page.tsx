'use client';

import { useState, useEffect } from 'react';
import { localStorageUtil } from '@/utils/localStorage';
import { fetchBusArrivals, formatDuration, getStatusClass, getStatusText, filterBusByNumber, formatArrivalTime } from '@/utils/busApi';
import { SavedBusStop } from '@/types/bus';
import Link from 'next/link';
import InstallButton from './components/InstallButton';

interface BusLineDisplay {
  stopId: string;
  stopName: string;
  stopCode: string;
  busNumber: string;
  operator?: string;
  status?: 'not_found' | 'no_data'; // 'not_found': 未查询到, 'no_data': 无班次
  buses?: {
    label: string;
    durationMs: number;
    time: string;
    monitored: number;
  }[];
}

export default function Home() {
  const [busLines, setBusLines] = useState<BusLineDisplay[]>([]);
  const [savedStops, setSavedStops] = useState<SavedBusStop[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingStops, setRefreshingStops] = useState<Set<string>>(new Set());

  // Load saved bus stops from localStorage
  useEffect(() => {
    // Initialize default stops on first load
    localStorageUtil.initializeDefaultStops();
    
    const stops = localStorageUtil.getBusStops();
    setSavedStops(stops);
    setLoading(false);
  }, []);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch bus arrival data
  useEffect(() => {
    if (savedStops.length === 0) return;

    const fetchAllBusData = async () => {
      try {
        console.log(`⏰ 自动刷新开始 - ${new Date().toLocaleTimeString()}`);
        const allBusLines: BusLineDisplay[] = [];

        for (const stop of savedStops) {
          try {
            const data = await fetchBusArrivals(stop.code);
            const filteredServices = filterBusByNumber(data.services, stop.buses);
            console.log(`  站点 ${stop.name}: ${filteredServices.length} 条线路，监听 ${stop.buses.length} 条线路`);

            // Create entries for all monitored buses
            stop.buses.forEach((busNumber) => {
              const foundService = filteredServices.find(s => s.no === busNumber);
              
              if (foundService) {
                // Bus found with data
                allBusLines.push({
                  stopId: stop.id,
                  stopName: stop.name,
                  stopCode: stop.code,
                  busNumber: foundService.no,
                  operator: foundService.operator,
                  buses: [
                    {
                      label: '当前一趟',
                      durationMs: foundService.next.duration_ms,
                      time: foundService.next.time,
                      monitored: foundService.next.monitored,
                    },
                    {
                      label: '下一趟',
                      durationMs: foundService.next2.duration_ms,
                      time: foundService.next2.time,
                      monitored: foundService.next2.monitored,
                    },
                    {
                      label: '下下一趟',
                      durationMs: foundService.next3.duration_ms,
                      time: foundService.next3.time,
                      monitored: foundService.next3.monitored,
                    },
                  ],
                });
              } else {
                // Bus not found in API response
                allBusLines.push({
                  stopId: stop.id,
                  stopName: stop.name,
                  stopCode: stop.code,
                  busNumber: busNumber,
                  status: 'not_found',
                });
              }
            });
          } catch (err) {
            console.error(`Error fetching data for stop ${stop.code}:`, err);
            // Add placeholder for stops that failed to fetch
            stop.buses.forEach((busNumber) => {
              allBusLines.push({
                stopId: stop.id,
                stopName: stop.name,
                stopCode: stop.code,
                busNumber: busNumber,
                status: 'not_found',
              });
            });
          }
        }

        setBusLines(allBusLines);
        setError(null);
      } catch (err) {
        setError('获取公交数据失败');
        console.error('Error fetching bus data:', err);
      }
    };

    fetchAllBusData();
    const interval = setInterval(fetchAllBusData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [savedStops]);

  const getProgressPercentage = (durationMs: number) => {
    const maxTime = 900000; // 15 minutes in ms
    return Math.max(0, Math.min(100, ((maxTime - durationMs) / maxTime) * 100));
  };

  // Refresh single bus stop
  const refreshSingleStop = async (stopCode: string, stopId: string) => {
    setRefreshingStops(prev => new Set(prev).add(`${stopId}-${stopCode}`));
    
    try {
      const stop = savedStops.find(s => s.code === stopCode && s.id === stopId);
      if (!stop) return;

      console.log(`🔄 刷新站点: ${stop.name} (${stop.code})`);
      const data = await fetchBusArrivals(stop.code);
      console.log(`✅ 获取到数据:`, data);
      const filteredServices = filterBusByNumber(data.services, stop.buses);
      console.log(`🚌 过滤后的线路:`, filteredServices.map(s => ({
        no: s.no,
        next: `${Math.floor(s.next.duration_ms / 1000)}秒`,
        next2: `${Math.floor(s.next2.duration_ms / 1000)}秒`,
        next3: `${Math.floor(s.next3.duration_ms / 1000)}秒`,
      })));

      // Update only the lines for this stop
      setBusLines(prevLines => {
        // Build the complete new list by following savedStops order
        const allLines: BusLineDisplay[] = [];
        
        savedStops.forEach(savedStop => {
          if (savedStop.id === stopId && savedStop.code === stopCode) {
            // This is the stop being refreshed, use new data
            savedStop.buses.forEach((busNumber) => {
              const foundService = filteredServices.find(s => s.no === busNumber);
              
              if (foundService) {
                allLines.push({
                  stopId: savedStop.id,
                  stopName: savedStop.name,
                  stopCode: savedStop.code,
                  busNumber: foundService.no,
                  operator: foundService.operator,
                  buses: [
                    {
                      label: '当前一趟',
                      durationMs: foundService.next.duration_ms,
                      time: foundService.next.time,
                      monitored: foundService.next.monitored,
                    },
                    {
                      label: '下一趟',
                      durationMs: foundService.next2.duration_ms,
                      time: foundService.next2.time,
                      monitored: foundService.next2.monitored,
                    },
                    {
                      label: '下下一趟',
                      durationMs: foundService.next3.duration_ms,
                      time: foundService.next3.time,
                      monitored: foundService.next3.monitored,
                    },
                  ],
                });
              } else {
                allLines.push({
                  stopId: savedStop.id,
                  stopName: savedStop.name,
                  stopCode: savedStop.code,
                  busNumber: busNumber,
                  status: 'not_found',
                });
              }
            });
          } else {
            // Keep existing lines for other stops
            prevLines.forEach(line => {
              if (line.stopId === savedStop.id) {
                allLines.push(line);
              }
            });
          }
        });
        return allLines;
      });
    } catch (err) {
      console.error(`Error refreshing stop ${stopCode}:`, err);
    } finally {
      setTimeout(() => {
        setRefreshingStops(prev => {
          const next = new Set(prev);
          next.delete(`${stopId}-${stopCode}`);
          return next;
        });
      }, 500); // Show refreshing state for at least 500ms
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-white text-3xl font-bold mb-2">🚌 公交到站</h1>
          <div className="text-white/90 text-sm">{currentTime}</div>
        </div>

        {/* Empty State */}
        {savedStops.length === 0 && (
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
            <div className="text-5xl mb-4">🚏</div>
            <h2 className="text-xl font-bold mb-2">还没有监听的公交站点</h2>
            <p className="text-white/80 mb-4">点击下方按钮添加您要监听的站点和线路</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/90 backdrop-blur-lg rounded-2xl p-4 text-white text-center mb-6">
            {error}
          </div>
        )}

        {/* Bus Lines List */}
        <div className="flex flex-col gap-5">
          {busLines.map((line, index) => {
            const isRefreshing = refreshingStops.has(`${line.stopId}-${line.stopCode}`);
            
            return (
              <div key={`${line.stopId}-${line.busNumber}-${index}`} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                {/* Line Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-2xl font-bold mb-1">{line.busNumber}路</div>
                      <div className="text-sm opacity-90">{line.stopName}</div>
                    </div>
                    <button
                      onClick={() => refreshSingleStop(line.stopCode, line.stopId)}
                      disabled={isRefreshing}
                      className={`ml-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all ${
                        isRefreshing ? 'animate-spin' : ''
                      }`}
                      title="刷新此站点"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>

              {/* Buses Container */}
              <div>
                {line.status === 'not_found' ? (
                  // Show message for bus not found
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-4xl mb-2">🚫</div>
                    <p className="font-semibold">未查询到班次信息</p>
                    <p className="text-sm mt-1">该线路可能已停运或暂无班次</p>
                  </div>
                ) : line.buses && line.buses.length > 0 ? (
                  line.buses.map((bus, busIndex) => {
                    const statusClass = getStatusClass(bus.durationMs);
                    const progress = getProgressPercentage(bus.durationMs);
                    const formattedTime = formatArrivalTime(bus.time);

                    if (busIndex === 0) {
                      // First bus - show full details
                      return (
                        <div key={busIndex} className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-purple-600 font-semibold text-base">
                              {bus.label}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                                statusClass === 'arriving'
                                  ? 'bg-red-500 animate-pulse'
                                  : statusClass === 'soon'
                                  ? 'bg-orange-500'
                                  : 'bg-blue-500'
                              }`}
                            >
                              {getStatusText(bus.durationMs)}
                            </span>
                          </div>

                          <div className="flex justify-between items-end mb-3">
                            <div>
                              <div className="text-3xl font-bold text-gray-900">
                                {formatDuration(bus.durationMs)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">预计到达</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {bus.monitored === 1 ? '📍 实时位置' : '⏱️ 预计时间'}
                              </div>
                              <div className="text-gray-900 text-lg font-semibold">
                                {formattedTime}
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                statusClass === 'arriving'
                                  ? 'bg-red-500'
                                  : statusClass === 'soon'
                                  ? 'bg-orange-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    } else {
                      // Subsequent buses - simple display
                      const subsequentArrivalTime = formatArrivalTime(bus.time);
                      return (
                        <div
                          key={busIndex}
                          className={`px-4 py-3 ${
                            busIndex < (line.buses?.length ?? 0) - 1 ? 'border-b border-gray-200' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {bus.label}
                            </span>
                            <span className="text-gray-900 text-lg font-semibold flex-1 text-center">
                              {formatDuration(bus.durationMs)}
                            </span>
                            <div className="text-right">
                              <div className="text-gray-500 text-sm">
                                {bus.monitored === 1 ? '📍' : '⏱️'}
                              </div>
                              <div className="text-gray-900 text-sm font-semibold">
                                {subsequentArrivalTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-2xl mb-2">📭</div>
                    <p className="text-sm">暂无班次信息</p>
                  </div>
                )}
              </div>
              </div>
            );
          })}
        </div>

        {/* Add Bus Stop Button */}
        <Link style={{ marginTop: 20 }} 
          href="/manage"
          className="block w-full mb-6 bg-white/20 backdrop-blur-lg rounded-2xl p-4 text-white text-center font-semibold hover:bg-white/30 transition-all"
        >
          ➕ 管理监听的站点和线路
        </Link>


        {/* Install Button */}
        <div className="mb-4">
          <InstallButton />
        </div>


        {/* Footer */}
        <div className="text-center mt-6 text-white/70 text-sm">
          <p>数据每5秒自动更新</p>
        </div>
      </div>
    </div>
  );
}
