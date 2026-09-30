'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Ellipsis, Plus, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PageHead, { Page } from '@/components/app/PageHead';
import ToneChip, { ToneDot } from '@/components/app/ToneChip';
import EmptyState from '@/components/EmptyState';
import ConfirmDelete from '@/components/ConfirmDelete';
import { toast } from '@/components/Toast';
import { Sheet, Field } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/axios';
import { useAuthReady } from '@/lib/store';
import { PRIORITY, TASK_STATUS } from '@/lib/stages';
import { date, errorText } from '@/lib/format';

type Status = 'pending' | 'in-progress' | 'completed';
interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: Status;
  dueDate?: string;
}

const emptyForm = { title: '', description: '', priority: 'medium', dueDate: '' };
const HEAT = { high: 0, medium: 1, low: 2 } as const;

/* Open work first, soonest due first, hottest first within a day. Done work
   sinks to the bottom rather than disappearing — it is still a record. */
const order = (a: Task, b: Task) => {
  const doneA = a.status === 'completed' ? 1 : 0;
  const doneB = b.status === 'completed' ? 1 : 0;
  if (doneA !== doneB) return doneA - doneB;
  const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
  const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
  if (da !== db) return da - db;
  return HEAT[a.priority] - HEAT[b.priority];
};

export default function Tasks() {
  const reduce = useReducedMotion();
  const authReady = useAuthReady();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [today] = useState(() => new Date().setHours(0, 0, 0, 0));

  const load = () =>
    api
      .get('/tasks')
      .then((r) => setTasks(r.data.data))
      .catch(() => toast.error('Görevler yüklenemedi'));

  useEffect(() => {
    if (!authReady) return;
    load().finally(() => setLoading(false));
  }, [authReady]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tasks.length };
    for (const t of tasks) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tasks]);

  const overdue = tasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate).getTime() < today).length;
  const list = useMemo(
    () => tasks.filter((t) => filter === 'all' || t.status === filter).sort(order),
    [tasks, filter],
  );

  const setStatus = async (t: Task, status: Status) => {
    if (t.status === status) return;
    const before = tasks;
    setTasks((all) => all.map((x) => (x._id === t._id ? { ...x, status } : x)));
    try {
      await api.put(`/tasks/${t._id}`, { status });
      toast.success(status === 'completed' ? 'Görev tamamlandı' : `Durum: ${TASK_STATUS[status].label}`);
    } catch {
      setTasks(before);
      toast.error('Durum güncellenemedi');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/tasks', form);
      toast.success('Görev eklendi');
      setSheetOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setFormError(errorText(err, 'Görev eklenemedi'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await api.delete(`/tasks/${target._id}`);
      setTasks((all) => all.filter((x) => x._id !== target._id));
      toast.success('Görev silindi');
    } catch {
      toast.error('Silme başarısız');
    }
  };

  return (
    <AppShell>
      <Page>
        <PageHead
          label="Yapılacaklar"
          title="Görevler"
          meta={`${tasks.length - (counts.completed ?? 0)} açık${overdue ? ` · ${overdue} gecikmiş` : ''} · ${counts.completed ?? 0} tamamlandı`}
          actions={
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setFormError('');
                setSheetOpen(true);
              }}
              className="btn btn-sm"
            >
              <Plus className="size-4" aria-hidden />
              Görev ekle
            </button>
          }
        />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="segmented" role="group" aria-label="Duruma göre süz">
            {(['all', 'pending', 'in-progress', 'completed'] as const).map((s) => (
              <button key={s} type="button" className="segmented-item" aria-pressed={filter === s} onClick={() => setFilter(s)}>
                {s === 'all' ? 'Tümü' : TASK_STATUS[s].label}
                <span className="figure ml-1.5 opacity-70">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
          {/* The legend for the dots: priority is heat. */}
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-3" aria-hidden>
            {(['high', 'medium', 'low'] as const).map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <ToneDot tone={PRIORITY[p].tone} />
                {PRIORITY[p].label}
              </span>
            ))}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2" role="status" aria-label="Yükleniyor">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[4.5rem] animate-pulse rounded-[var(--radius-lg)] bg-panel" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState variant="tasks" ctaLabel="Görev ekle" onCta={() => setSheetOpen(true)} />
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {list.map((t) => {
                const pr = PRIORITY[t.priority] ?? PRIORITY.medium;
                const st = TASK_STATUS[t.status] ?? TASK_STATUS.pending;
                const done = t.status === 'completed';
                const late = !done && t.dueDate && new Date(t.dueDate).getTime() < today;
                return (
                  <motion.li
                    key={t._id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                    className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-panel px-4 py-3.5"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={done ? `${t.title}: tamamlandı, geri al` : `${t.title}: tamamla`}
                      onClick={() => setStatus(t, done ? 'pending' : 'completed')}
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors ${
                        done ? 'border-won bg-won text-ground' : 'border-line-strong hover:border-fg-2'
                      }`}
                    >
                      {done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2">
                        <ToneDot tone={pr.tone} />
                        <span className="sr-only">{pr.label} öncelik:</span>
                        <span className={`min-w-0 text-sm font-medium ${done ? 'text-fg-3 line-through' : 'text-fg'}`}>{t.title}</span>
                      </p>
                      {t.description && <p className="mt-1 line-clamp-2 text-sm text-fg-2">{t.description}</p>}
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <ToneChip tone={st.tone}>{st.label}</ToneChip>
                        {t.dueDate && (
                          <span className={`figure text-xs ${late ? 'text-fg' : 'text-fg-3'}`}>
                            {late ? 'gecikti · ' : ''}
                            {date(t.dueDate)}
                          </span>
                        )}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`${t.title} için işlemler`}
                        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-fg-3 transition-colors hover:bg-lift hover:text-fg data-[state=open]:bg-lift"
                      >
                        <Ellipsis className="size-4" aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-48">
                        <DropdownMenuLabel>Durum</DropdownMenuLabel>
                        {(['pending', 'in-progress', 'completed'] as const)
                          .filter((s) => s !== t.status)
                          .map((s) => (
                            <DropdownMenuItem key={s} onSelect={() => setStatus(t, s)}>
                              <ToneDot tone={TASK_STATUS[s].tone} />
                              {TASK_STATUS[s].label}
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setTimeout(() => setPendingDelete(t), 0)}>
                          <Trash2 aria-hidden />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </Page>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title="Yeni görev" description="Size atanır; son tarihe göre sıralanır.">
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          {formError && (
            <div role="alert" className="notice col-span-2">
              {formError}
            </div>
          )}
          <Field id="t-title" label="Başlık" className="col-span-2">
            <input
              id="t-title"
              required
              minLength={3}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
            />
          </Field>
          <Field id="t-desc" label="Açıklama" className="col-span-2">
            <textarea
              id="t-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
            />
          </Field>
          <Field id="t-priority" label="Öncelik" className="col-span-2 sm:col-span-1">
            <select id="t-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input">
              {Object.entries(PRIORITY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="t-due" label="Son tarih" className="col-span-2 sm:col-span-1">
            <input id="t-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input figure" />
          </Field>
          <div className="col-span-2 mt-2 flex gap-2">
            <button type="submit" disabled={saving} className="btn">
              {saving ? 'Kaydediliyor' : 'Görevi ekle'}
            </button>
            <button type="button" onClick={() => setSheetOpen(false)} className="btn-secondary">
              Vazgeç
            </button>
          </div>
        </form>
      </Sheet>

      <ConfirmDelete
        target={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
        name={(t) => t.title}
        detail={() => 'Görev listeden kaldırılır.'}
      />
    </AppShell>
  );
}
