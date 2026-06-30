import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Loader2 } from 'lucide-react';
import { staffApi, registrationApi } from '@/lib/api';

interface InstallmentConfig {
  id?: string;
  installmentNumber: number;
  percentage: number;
  deadlineDate: string;
}

export default function StaffTermConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [termId, setTermId] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);
  const [finalDeadlineDate, setFinalDeadlineDate] = useState<string>('');
  const [penaltyPercentage, setPenaltyPercentage] = useState<number>(5);
  const [initialPaymentPercentage, setInitialPaymentPercentage] = useState<number>(100);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const termsRes = await registrationApi.getTerm();
        const activeTerm = termsRes.data;
        
        if (activeTerm && activeTerm.id) {
          setTermId(activeTerm.id);
          try {
             const configRes = await staffApi.getTermConfig(activeTerm.id);
             if (configRes.data) {
                setPenaltyPercentage(Number(configRes.data.penaltyPercentage) * 100);
                if (configRes.data.initialPaymentPercentage !== undefined) {
                  setInitialPaymentPercentage(Number(configRes.data.initialPaymentPercentage));
                }
                if (configRes.data.installments && configRes.data.installments.length > 0) {
                  setInstallmentsCount(configRes.data.installments.length);
                  setFinalDeadlineDate(configRes.data.installments[configRes.data.installments.length - 1].deadlineDate || '');
                }
             }
          } catch (e) {
             // Config might not exist yet
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

    if (!finalDeadlineDate) {
      setMessage({ type: 'error', text: 'Please set the Final Deadline Date.' });
      return;
    }

    if (installmentsCount < 1) {
      setMessage({ type: 'error', text: 'Number of installments must be at least 1.' });
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(finalDeadlineDate);
    d.setHours(0, 0, 0, 0);
    if (d < today) {
      setMessage({ type: 'error', text: 'Final deadline date cannot be in the past.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const remainingPercentage = 100 - initialPaymentPercentage;
      const generatedInstallments = Array.from({ length: installmentsCount }).map((_, i) => ({
        installmentNumber: i + 1,
        percentage: i === 0 ? remainingPercentage : 0,
        deadlineDate: finalDeadlineDate
      }));

      await staffApi.saveTermConfig({
        termId,
        installments: generatedInstallments,
        penaltyPercentage: penaltyPercentage / 100,
        initialPaymentPercentage: initialPaymentPercentage
      });
      setMessage({ type: 'success', text: 'Term configuration saved successfully.' });
    } catch (err: any) {
      let errorMsg = 'Failed to save configuration.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        }
      }
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Active Term</label>
                  <input 
                    type="text" 
                    value={termId}
                    disabled
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-500 font-medium"
                  />
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
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Payment Required (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={initialPaymentPercentage}
                    onChange={(e) => setInitialPaymentPercentage(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum upfront payment required to get an exam permit.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-md font-semibold text-slate-800 mb-4">Student Custom Installment Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Installments Allowed</label>
                    <input 
                      type="number" 
                      min={1}
                      max={12}
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">How many installments the student is allowed to create.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Final Term Deadline</label>
                    <input 
                      type="date"
                      value={finalDeadlineDate}
                      onChange={(e) => setFinalDeadlineDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">The latest possible date a student can pick for their final installment.</p>
                  </div>
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
