'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { ITask } from '@/shared/types';
import { toast } from '@/components/Toast';
import EmptyState from '@/components/EmptyState';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusLabel: Record<string, string> = { pending: 'Beklemede', 'in-progress': 'Devam', completed: 'Tamamlandı' };
const statusBadge: Record<string, string> = { pending: 'badge-caution', 'in-progress': 'badge-accent', completed: 'badge-positive' };
const priorityDot: Record<string, string> = { high: 'bg-[var(--destructive)]', medium: 'bg-[var(--caution)]', low: 'bg-[var(--quiet)]' };
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Görevler</h1>
            <p className="text-muted-foreground text-sm mt-1">{tasks.length} görev listeleniyor</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Yeni Görev</button>
        </div>

        {error && <div role="alert" className="notice mb-5">{error}</div>}

        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Yeni Görev</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label block mb-1.5">Başlık *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label block mb-1.5">Açıklama</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-1.5">Öncelik</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as any })} className="input">
                    <option value="low">Düşük</option><option value="medium">Orta</option><option value="high">Yüksek</option>
                  </select>
                </div>
                <div>
                  <label className="label block mb-1.5">Bitiş Tarihi</label>
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

        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit mb-5">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f.key ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'}`}>
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
                        className={`shrink-0 w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          task.status === 'completed'
                            ? 'bg-[var(--positive)] border-[var(--positive)]'
                            : 'border-border hover:border-[var(--positive)]'
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
                      <span className={`text-sm font-semibold text-foreground ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground ml-4 mb-2 line-clamp-1">{task.description}</p>}
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`badge ${statusBadge[task.status]}`}>{statusLabel[task.status]}</span>
                      <span className="text-xs text-muted-foreground">{priorityLabel[task.priority]} öncelik</span>
                      {task.dueDate && <span className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select value={task.status} onChange={e => updateStatus(task._id!, e.target.value)} className="text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none text-muted-foreground bg-card">
                      <option value="pending">Beklemede</option>
                      <option value="in-progress">Devam</option>
                      <option value="completed">Tamamlandı</option>
                    </select>
                    <button onClick={() => deleteTask(task._id!)} className="p-1.5 text-muted-foreground hover:text-ink-2 hover:bg-paper-3 rounded-lg transition">
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
