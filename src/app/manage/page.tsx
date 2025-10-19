'use client';

import { useState, useEffect } from 'react';
import { localStorageUtil } from '@/utils/localStorage';
import { SavedBusStop } from '@/types/bus';
import Link from 'next/link';

export default function ManagePage() {
  const [busStops, setBusStops] = useState<SavedBusStop[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    buses: '',
  });

  useEffect(() => {
    loadBusStops();
  }, []);

  const loadBusStops = () => {
    const stops = localStorageUtil.getBusStops();
    setBusStops(stops);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const busesArray = formData.buses
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    if (!formData.name || !formData.code || busesArray.length === 0) {
      alert('请填写所有必填字段');
      return;
    }

    if (editingId) {
      // Update existing
      localStorageUtil.updateBusStop(editingId, {
        name: formData.name,
        code: formData.code,
        buses: busesArray,
      });
    } else {
      // Add new
      localStorageUtil.addBusStop({
        name: formData.name,
        code: formData.code,
        buses: busesArray,
      });
    }

    // Reset form
    setFormData({ name: '', code: '', buses: '' });
    setIsAdding(false);
    setEditingId(null);
    loadBusStops();
  };

  const handleEdit = (stop: SavedBusStop) => {
    setFormData({
      name: stop.name,
      code: stop.code,
      buses: stop.buses.join(', '),
    });
    setEditingId(stop.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个站点吗？')) {
      localStorageUtil.deleteBusStop(id);
      loadBusStops();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', code: '', buses: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleMoveUp = (id: string) => {
    localStorageUtil.moveStopUp(id);
    loadBusStops();
  };

  const handleMoveDown = (id: string) => {
    localStorageUtil.moveStopDown(id);
    loadBusStops();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-white text-3xl font-bold mb-2">🚏 站点管理</h1>
          <p className="text-white/80 text-sm">添加、编辑或调整站点显示顺序</p>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="block w-full mb-6 bg-white/20 backdrop-blur-lg rounded-2xl p-4 text-white text-center font-semibold hover:bg-white/30 transition-all"
        >
          ← 返回主页
        </Link>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? '编辑站点' : '添加新站点'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  站点名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: 深圳湾公园站"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  站点代码 *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="例如: 67661"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  输入公交站点的代码（通常是5位数字）
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  监听的线路 *
                </label>
                <input
                  type="text"
                  value={formData.buses}
                  onChange={(e) => setFormData({ ...formData, buses: e.target.value })}
                  placeholder="例如: 371, 5, 14"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  输入要监听的公交线路号，多个线路用逗号分隔
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                >
                  {editingId ? '保存修改' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bus Stops List */}
        <div className="space-y-4">
          {busStops.length === 0 ? (
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg">还没有添加任何站点</p>
              <p className="text-sm text-white/80 mt-2">点击下方按钮添加您的第一个站点</p>
            </div>
          ) : (
            busStops.map((stop, index) => (
              <div
                key={stop.id}
                className="bg-white rounded-2xl p-5 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {stop.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      站点代码: <span className="font-mono font-semibold">{stop.code}</span>
                    </p>
                  </div>
                  
                  {/* Sort buttons */}
                  <div className="flex flex-col gap-1 ml-3">
                    <button
                      onClick={() => handleMoveUp(stop.id)}
                      disabled={index === 0}
                      className={`p-1 rounded ${
                        index === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-purple-600 hover:bg-purple-100'
                      }`}
                      title="上移"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(stop.id)}
                      disabled={index === busStops.length - 1}
                      className={`p-1 rounded ${
                        index === busStops.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-purple-600 hover:bg-purple-100'
                      }`}
                      title="下移"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">监听线路:</div>
                  <div className="flex flex-wrap gap-2">
                    {stop.buses.map((bus) => (
                      <span
                        key={bus}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {bus}路
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(stop)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    onClick={() => handleDelete(stop.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
                  >
                    🗑️ 删除
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  创建于: {new Date(stop.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Button - at the bottom */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full mt-6 bg-white rounded-2xl p-4 text-purple-600 font-bold text-lg hover:bg-white/90 transition-all shadow-lg"
          >
            ➕ 添加新站点
          </button>
        )}
      </div>
    </div>
  );
}

