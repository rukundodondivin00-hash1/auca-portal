import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi, registrationApi } from '@/lib/api';

export default function AdminTermConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [termId, setTermId] = useState('');
  const [maxInstallments, setMaxInstallments] = useState<number>(3);
  const [penaltyPercentage, setPenaltyPercentage] = useState<number>(5);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        // Fetch active term first
        const termsRes = await registrationApi.getTerm();
        const activeTerm = termsRes.data;
        
        if (activeTerm && activeTerm.id) {
          setTermId(activeTerm.id);
          try {
             const configRes = await adminApi.getTermConfig(activeTerm.id);
             if (configRes.data) {
                setMaxInstallments(configRes.data.maxInstallments);
                setPenaltyPercentage(Number(configRes.data.penaltyPercentage) * 100);
             }
          } catch (e) {
             // Config might not exist yet, defaults will apply
          }
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!termId) return;
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.saveTermConfig({
        termId,
        maxInstallments,
        penaltyPercentage: penaltyPercentage / 100
      });
      setMessage({ type: 'success', text: 'Term configuration saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 p-6 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Settings className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Term Contract Configuration</h2>
            <p className="text-sm text-slate-500">Set the allowed installments and penalty rates for the active academic term.</p>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : !termId ? (
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p>No active term found. Please activate a term in Academic Setup first.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <AlertCircle className="w-5 h-5" />
                  {message.text}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Active Term</label>
                <input 
                  type="text" 
                  value={termId}
                  disabled
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Installments allowed</label>
                  <input 
                    type="number" 
                    min={1}
                    max={10}
                    value={maxInstallments}
                    onChange={(e) => setMaxInstallments(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Students will be forced to split their balance into exactly this many installments.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Penalty Percentage (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={penaltyPercentage}
                    onChange={(e) => setPenaltyPercentage(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Penalty applied overnight when an installment deadline is missed.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#00447b] hover:bg-blue-900 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
