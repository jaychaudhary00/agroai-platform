import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { reminderAPI, aiAPI } from '../services/api';

interface Reminder {
  _id: string;
  plantName: string;
  type: string;
  scheduledAt: string;
  isCompleted: boolean;
  note?: string;
}

interface PlantCareResult {
  species: string;
  issue: string;
  sunlightRequirement: string;
  wateringSchedule: string;
  humidity: string;
  temperature: string;
  recoveryPlan: string;
  repottingAdvice: string;
  isHealthy: boolean;
  relatedVideos?: { title: string; url: string }[];
  imageUrl: string;
}

const TYPE_ICONS: Record<string,string> = { watering:'💧', fertilizing:'🌿', pruning:'✂️', repotting:'🪴' };
const TYPE_COLORS: Record<string,string> = {
  watering: 'bg-blue-50 dark:bg-blue-900/20',
  fertilizing: 'bg-green-50 dark:bg-green-900/20',
  pruning: 'bg-amber-50 dark:bg-amber-900/20',
  repotting: 'bg-purple-50 dark:bg-purple-900/20',
};

export function HomeGrowerPage() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ plantName: '', type: 'watering', scheduledAt: '', repeatEvery: '', note: '' });
  const [adding, setAdding] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [careResult, setCareResult] = useState<PlantCareResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Simulated weather
  const weather = { temp: 31, rainFri: true, heatwave: false, city: 'Anand, Gujarat' };

  useEffect(() => {
    reminderAPI.getAll()
      .then(r => setReminders(r.data.data))
      .catch(() => {})
      .finally(() => setLoadingReminders(false));
  }, []);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plantName || !form.scheduledAt) { toast.error('Fill in required fields'); return; }
    setAdding(true);
    try {
      const res = await reminderAPI.create(form);
      setReminders(prev => [...prev, res.data.data]);
      setForm({ plantName: '', type: 'watering', scheduledAt: '', repeatEvery: '', note: '' });
      setShowAddForm(false);
      toast.success(t('common.success'));
    } catch { toast.error('Failed to add reminder'); }
    finally { setAdding(false); }
  };

  const handleComplete = async (id: string) => {
    try {
      await reminderAPI.complete(id);
      setReminders(prev => prev.map(r => r._id === id ? { ...r, isCompleted: true } : r));
      toast.success('Marked as done ✓');
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await reminderAPI.delete(id);
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success(t('common.success'));
    } catch { toast.error('Delete failed'); }
  };

  const onDrop = useCallback((files: File[]) => {
    const f = files[0]; if (!f) return;
    setFile(f); setCareResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const analyzeePlant = async () => {
    if (!file) { toast.error('Upload a plant photo first'); return; }
    setAnalyzing(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await aiAPI.getPlantCare(fd);
      setCareResult(res.data.data);
      toast.success('Analysis complete!');
    } catch { toast.error('Analysis failed'); }
    finally { setAnalyzing(false); }
  };

  const upcoming = reminders.filter(r => !r.isCompleted).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const completed = reminders.filter(r => r.isCompleted);

  const isOverdue = (date: string) => new Date(date) < new Date();
  const isDueToday = (date: string) => {
    const d = new Date(date); const now = new Date();
    return d.toDateString() === now.toDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">Plant care system</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Smart reminders, AI plant diagnosis, and weather-aware care advice</p>
      </div>

      {/* Weather alert banner */}
      {weather.rainFri && (
        <div className="bg-blue-600 text-white rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🌧️</span>
          <div>
            <div className="font-medium text-sm">Rain expected Friday–Saturday in {weather.city}</div>
            <div className="text-xs opacity-90 mt-0.5">
              Skip outdoor plant watering on Thursday and Friday. Consider moving sun-sensitive plants under shelter before Saturday.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Reminders panel ── */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900 dark:text-white">Care reminders</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <form onSubmit={handleAddReminder} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Plant name *</label>
                    <input value={form.plantName} onChange={e => setForm({...form, plantName:e.target.value})} placeholder="e.g. Monstera" className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Type *</label>
                    <select value={form.type} onChange={e => setForm({...form, type:e.target.value})} className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date & time *</label>
                    <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt:e.target.value})} className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Repeat every (days)</label>
                    <input type="number" value={form.repeatEvery} onChange={e => setForm({...form, repeatEvery:e.target.value})} placeholder="e.g. 7" className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <input value={form.note} onChange={e => setForm({...form, note:e.target.value})} placeholder="Optional note..." className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <div className="flex gap-2">
                  <button type="submit" disabled={adding} className="flex-1 bg-primary-600 text-white text-sm py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    {adding ? '⏳ Saving...' : 'Save reminder'}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reminder list */}
            <div className="space-y-2">
              {loadingReminders ? (
                Array.from({length:3}).map((_,i) => <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />)
              ) : upcoming.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No upcoming reminders — add one above!</div>
              ) : upcoming.map(r => (
                <div key={r._id} className={`flex items-center gap-3 p-3 ${TYPE_COLORS[r.type] || 'bg-gray-50 dark:bg-gray-800'} rounded-xl`}>
                  <div className="w-9 h-9 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {TYPE_ICONS[r.type] || '🌿'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{r.plantName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {r.type} · {new Date(r.scheduledAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </div>
                    {r.note && <div className="text-xs text-gray-400 truncate">{r.note}</div>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isOverdue(r.scheduledAt) && !isDueToday(r.scheduledAt) ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                    ) : isDueToday(r.scheduledAt) ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Today</span>
                    ) : null}
                    <button onClick={() => handleComplete(r._id)} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center text-sm" title="Mark done">✓</button>
                    <button onClick={() => handleDeleteReminder(r._id)} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center text-sm" title="Delete">×</button>
                  </div>
                </div>
              ))}
            </div>

            {completed.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 mb-2">Completed ({completed.length})</p>
                {completed.slice(0,2).map(r => (
                  <div key={r._id} className="flex items-center gap-2 py-1.5 opacity-50">
                    <span className="text-base">{TYPE_ICONS[r.type]}</span>
                    <span className="text-xs text-gray-500 line-through">{r.plantName} — {r.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── AI Plant Care panel ── */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-white mb-4">AI plant diagnosis</h2>

            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-3 ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'}`}>
              <input {...getInputProps()} />
              {preview ? (
                <img src={preview} alt="Plant" className="mx-auto max-h-40 rounded-lg object-contain" />
              ) : (
                <div>
                  <div className="text-3xl mb-2">🌿</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Drop or click to upload your plant photo</p>
                </div>
              )}
            </div>

            <button onClick={analyzeePlant} disabled={!file || analyzing} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {analyzing ? <><span className="animate-spin">⟳</span> Analyzing...</> : <>🔬 Get AI care advice</>}
            </button>

            {careResult && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{careResult.species}</div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${careResult.isHealthy ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                    {careResult.isHealthy ? '✓ Healthy' : '⚠️ ' + careResult.issue}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:'☀️ Sunlight', value: careResult.sunlightRequirement },
                    { label:'💧 Watering', value: careResult.wateringSchedule },
                    { label:'🌡️ Temperature', value: careResult.temperature },
                    { label:'💦 Humidity', value: careResult.humidity },
                  ].map(({label,value}) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</div>
                    </div>
                  ))}
                </div>

                {careResult.recoveryPlan && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-1">🌱 Recovery plan</div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{careResult.recoveryPlan}</p>
                  </div>
                )}

                {careResult.relatedVideos?.length ? (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                    <div className="text-xs text-gray-400 mb-2">🎬 Care videos</div>
                    {careResult.relatedVideos.map((v,i) => (
                      <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        <span className="w-5 h-5 bg-red-100 rounded flex items-center justify-center text-red-600">▶</span>
                        {v.title}
                      </a>
                    ))}
                  </div>
                ) : null}

                {/* Quick add reminder */}
                <button onClick={() => setShowAddForm(true)} className="w-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 py-2 rounded-lg hover:bg-primary-100 transition-colors">
                  + Set watering reminder for {careResult.species.split(' ')[0]}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
