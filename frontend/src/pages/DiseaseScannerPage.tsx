import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { aiAPI } from '../services/api';

interface DiseaseResult {
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: string;
  prevention: string;
  fertilizerAdvice: string;
  wateringAdvice: string;
  relatedVideos: { title: string; url: string; thumbnail: string }[];
  imageUrl: string;
}

const severityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function DiseaseScannerPage() {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cropType, setCropType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [isListening, setIsListening] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please select a plant image first'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (cropType) formData.append('cropType', cropType);
      const res = await aiAPI.detectDisease(formData);
      setResult(res.data.data);
      toast.success('Analysis complete!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice input not supported in this browser'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    setIsListening(true);
    recognition.onresult = (event: any) => {
      setCropType(event.results[0][0].transcript);
      setIsListening(false);
      toast.success('Voice captured!');
    };
    recognition.onerror = () => { setIsListening(false); toast.error('Voice recognition failed'); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">Plant disease scanner</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('disease.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="font-medium text-gray-900 dark:text-white mb-4">{ t('disease.uploadImage') }</h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <img src={preview} alt="Plant preview" className="mx-auto max-h-48 rounded-lg object-contain" />
              ) : (
                <div>
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop image here or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC · Max 10MB</p>
                </div>
              )}
            </div>

            {/* Crop type + voice */}
            <div className="mt-4 flex gap-2">
              <input
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                placeholder="Crop type (e.g. Tomato, Wheat)"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={startVoice}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  isListening
                    ? 'bg-red-100 border-red-300 text-red-700 animate-pulse'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                title="Voice input"
              >
                🎙️
              </button>
            </div>
            {isListening && <p className="text-xs text-red-500 mt-1 text-center animate-pulse">Listening... speak now</p>}

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full mt-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> { t('disease.analyzing') }</>
              ) : (
                <><span>🔬</span> Analyze disease</>
              )}
            </button>
          </div>

          {/* Quick tips */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4">
            <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-2 text-sm">📷 Tips for best results</h3>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Take close-up photos of affected leaves</li>
              <li>• Use good natural lighting</li>
              <li>• Include both healthy and diseased areas</li>
              <li>• Avoid blurry or dark images</li>
            </ul>
          </div>
        </div>

        {/* Results panel */}
        <div>
          {result ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-400 mb-1">AI diagnosis</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{result.diseaseName}</h2>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${severityColors[result.severity]}`}>
                  {result.severity} risk
                </span>
              </div>

              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Confidence</span>
                  <span className="font-medium text-primary-600">{result.confidence}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">{result.description}</p>

              {/* Advice grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '💊 Treatment', content: result.treatment },
                  { label: '🛡️ Prevention', content: result.prevention },
                  { label: '💧 Watering', content: result.wateringAdvice },
                  { label: '🌿 Fertilizer', content: result.fertilizerAdvice },
                ].map(({ label, content }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
                  </div>
                ))}
              </div>

              {/* YouTube videos */}
              {result.relatedVideos?.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">🎬 Related videos</div>
                  <div className="space-y-2">
                    {result.relatedVideos.map((v, i) => (
                      <a
                        key={i}
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-red-600 text-sm flex-shrink-0">▶</div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 line-clamp-1">{v.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 flex flex-col items-center justify-center text-center h-full min-h-64">
              <div className="text-5xl mb-4 opacity-30">🌿</div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">{t('disease.noImage')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
