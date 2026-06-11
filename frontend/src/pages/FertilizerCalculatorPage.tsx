import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { aiAPI } from '../services/api';

const CROPS = ['Wheat','Rice','Cotton','Maize','Soybean','Groundnut','Bajra','Jowar','Sugarcane','Tomato','Onion','Potato','Chilli','Turmeric','Mustard','Sunflower','Barley','Gram','Lentil','Pea'];
const SOILS = ['Black soil (Vertisol)','Red laterite','Sandy loam','Clay loam','Alluvial soil','Sandy soil','Loamy soil','Silty clay','Saline soil','Alkaline soil'];
const UNITS = ['acres','hectares','bigha'];

interface FertResult {
  nitrogen: { amount: number; unit: string; product: string; totalAmount: number };
  phosphorus: { amount: number; unit: string; product: string; totalAmount: number };
  potassium: { amount: number; unit: string; product: string; totalAmount: number };
  applicationSchedule: string[];
  estimatedCost: number;
  micronutrients: string;
  notes: string;
}

export function FertilizerCalculatorPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ cropType: '', soilType: '', fieldArea: '', fieldAreaUnit: 'acres', plantAge: '' });
  const [result, setResult] = useState<FertResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cropType || !form.soilType || !form.fieldArea) { toast.error('Fill all required fields'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.calculateFertilizer(form);
      setResult(res.data.data);
      toast.success('Fertilizer recommendation ready!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Calculation failed. Check your Gemini API key.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🌿 AI Fertilizer Calculator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get precise NPK fertilizer recommendations based on your crop, soil, and field details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Enter Field Details</h2>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Crop Type *</label>
              <select value={form.cropType} onChange={e => setForm({...form, cropType: e.target.value})} required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select crop</option>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Soil Type *</label>
              <select value={form.soilType} onChange={e => setForm({...form, soilType: e.target.value})} required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select soil type</option>
                {SOILS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Field Area *</label>
                <input type="number" value={form.fieldArea} onChange={e => setForm({...form, fieldArea: e.target.value})}
                  placeholder="e.g. 5" min="0.1" step="0.1" required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Unit</label>
                <select value={form.fieldAreaUnit} onChange={e => setForm({...form, fieldAreaUnit: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Plant Age (days)</label>
              <input type="number" value={form.plantAge} onChange={e => setForm({...form, plantAge: e.target.value})}
                placeholder="e.g. 30 (0 = at sowing)" min="0"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⟳</span> Calculating with AI...</> : <>🌿 Calculate Fertilizer Recommendation</>}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">💡 How it works</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              Our AI analyzes your crop type, soil composition, field size, and plant growth stage to recommend precise NPK ratios and application schedules.
            </p>
          </div>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">AI Recommendation</h2>
                <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">
                  Est. cost: ₹{result.estimatedCost?.toLocaleString()}
                </span>
              </div>

              {/* NPK Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Nitrogen (N)', data: result.nitrogen, color: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
                  { label: 'Phosphorus (P)', data: result.phosphorus, color: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
                  { label: 'Potassium (K)', data: result.potassium, color: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400' },
                ].map(({ label, data, color, text }) => (
                  <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                    <div className={`text-xs font-medium ${text} mb-1`}>{label}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{data?.amount}</div>
                    <div className="text-xs text-gray-500">{data?.unit}</div>
                    <div className={`text-xs font-medium ${text} mt-1`}>Total: {data?.totalAmount} kg</div>
                    <div className="text-xs text-gray-500 mt-1 truncate" title={data?.product}>{data?.product}</div>
                  </div>
                ))}
              </div>

              {/* Application Schedule */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">📅 Application Schedule</div>
                <div className="space-y-1.5">
                  {result.applicationSchedule?.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Micronutrients */}
              {result.micronutrients && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">⚗️ Micronutrients</div>
                  <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">{result.micronutrients}</p>
                </div>
              )}

              {/* Notes */}
              {result.notes && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">📝 Important Notes</div>
                  <p className="text-xs text-green-600 dark:text-green-300 leading-relaxed">{result.notes}</p>
                </div>
              )}

              <button onClick={() => setResult(null)}
                className="w-full text-sm text-gray-500 border border-gray-200 dark:border-gray-700 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                ← Calculate for another field
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 flex flex-col items-center justify-center text-center h-full min-h-80">
              <div className="text-6xl mb-4 opacity-30">🌿</div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Fill in your field details and click Calculate to get AI-powered fertilizer recommendations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
