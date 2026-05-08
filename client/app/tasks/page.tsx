'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { ITask } from '@/shared/types';
import { toast } from '@/components/Toast';
import EmptyState from '@/components/EmptyState';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusLabel: Record<string, string> = { pending: 'Beklemede', 'in-progress': 'Devam', completed: 'Tamamlandı' };
const statusBadge: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', 'in-progress': 'bg-blue-50 text-blue-700', completed: 'bg-emerald-50 text-emerald-700' };
const priorityDot: Record<string, string> = { high: 'bg-rose-500', medium: 'bg-amber-400', low: 'bg-emerald-500' };
const priorityLabel: Record<string, string> = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' };

export default function Tasks() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high', dueDate: '' });

  useEffect(() => { fetchTasks(); }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filter === 'all' ? `${API_URL}/tasks` : `${API_URL}/tasks?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Görevler yüklenemedi');
      setTasks((await res.json()).data);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('Görev oluşturulamadı');
      toast.success('Görev oluşturuldu');
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '' }); setShowForm(false); fetchTasks();
    } catch (err: any) { setError(err.message); }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
    toast.success(status === 'completed' ? 'Görev tamamlandı' : 'Durum güncellendi');
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast.success('Görev silindi');
    fetchTasks();
  };

  const filters = [
    { key: 'all', label: 'Tümü' },
    { key: 'pending', label: 'Beklemede' },
    { key: 'in-progress', label: 'Devam Eden' },
    { key: 'completed', label: 'Tamamlanan' },
  ];

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl mx-auto animate-fade-in">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Görevler</h1>
            <p className="text-slate-500 text-sm mt-1">{tasks.length} görev listeleniyor</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Yeni Görev</button>
        </div>

        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">Yeni Görev</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Başlık *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Açıklama</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Öncelik</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as any })} className="input">
                    <option value="low">Düşük</option><option value="medium">Orta</option><option value="high">Yüksek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Bitiş Tarihi</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="input" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Oluştur</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-5">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f.key ? 'bg-white text-slate-900 shadow-card' : 'text-slate-500 hover:text-slate-700'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-5 h-16 animate-pulse" />)}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState variant="tasks" ctaLabel="İlk görevi oluştur" onCta={() => setShowForm(true)} />
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task._id} className="card px-5 py-4 group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      {/* Quick complete checkbox */}
                      <button
                        onClick={() => task.status !== 'completed' && updateStatus(task._id!, 'completed')}
                        className={`shrink-0 w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all ${
                          task.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
                        }`}
                        style={{ width: '18px', height: '18px', minWidth: '18px' }}
                        title={task.status === 'completed' ? 'Tamamlandı' : 'Tamamla'}
                      >
                        {task.status === 'completed' && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
                      <span className={`text-sm font-semibold text-slate-800 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</span>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 ml-4 mb-2 line-clamp-1">{task.description}</p>}
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`badge ${statusBadge[task.status]}`}>{statusLabel[task.status]}</span>
                      <span className="text-xs text-slate-400">{priorityLabel[task.priority]} öncelik</span>
                      {task.dueDate && <span className="text-xs text-slate-400">{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select value={task.status} onChange={e => updateStatus(task._id!, e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-slate-600 bg-white">
                      <option value="pending">Beklemede</option>
                      <option value="in-progress">Devam</option>
                      <option value="completed">Tamamlandı</option>
                    </select>
                    <button onClick={() => deleteTask(task._id!)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
