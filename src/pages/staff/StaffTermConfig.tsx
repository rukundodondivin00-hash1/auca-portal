import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
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
  const [installments, setInstallments] = useState<InstallmentConfig[]>([]);
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
                if (configRes.data.installments) {
                  setInstallments(configRes.data.installments.map((i: any) => ({
                    ...i,
                    deadlineDate: i.deadlineDate || ''
                  })));
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

  const handleAddInstallment = () => {
    setInstallments([
      ...installments,
      {
        installmentNumber: installments.length + 1,
        percentage: 0,
        deadlineDate: ''
      }
    ]);
  };

  const handleRemoveInstallment = (index: number) => {
    const updated = installments.filter((_, i) => i !== index);
    updated.forEach((inst, i) => inst.installmentNumber = i + 1);
    setInstallments(updated);
  };

  const handleUpdateInstallment = (index: number, field: keyof InstallmentConfig, value: any) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const handleSave = async () => {
    if (!termId) return;
    
    // Validate percentages
    const totalPercentage = initialPaymentPercentage + installments.reduce((sum, inst) => sum + Number(inst.percentage), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setMessage({ type: 'error', text: `Total percentage (Initial + Installments) must equal exactly 100%. Currently: ${totalPercentage}%` });
      return;
    }

    // Validate dates
    const missingDates = installments.some(i => !i.deadlineDate);
    if (missingDates) {
      setMessage({ type: 'error', text: 'Please set a deadline date for all installments.' });
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasPastDates = installments.some(i => {
      const d = new Date(i.deadlineDate);
      d.setHours(0, 0, 0, 0);
      return d < today;
    });
    if (hasPastDates) {
      setMessage({ type: 'error', text: 'Installment deadline dates cannot be in the past.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await staffApi.saveTermConfig({
        termId,
        installments: installments.map(i => ({
          ...i,
          percentage: Number(i.percentage)
        })),
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Payment (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={initialPaymentPercentage}
                    onChange={(e) => setInitialPaymentPercentage(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum upfront payment required for a contract (e.g. 50).</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-md font-semibold text-slate-800">Installment Schedule</h3>
                    <p className="text-sm text-slate-500">Define percentages and deadlines for payments.</p>
                  </div>
                  <button
                    onClick={handleAddInstallment}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Installment
                  </button>
                </div>

                {installments.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
                    No installments configured yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {installments.map((inst, index) => (
                      <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shrink-0">
                          #{inst.installmentNumber}
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Percentage (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={inst.percentage}
                            onChange={(e) => handleUpdateInstallment(index, 'percentage', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Deadline Date</label>
                          <input
                            type="date"
                            value={inst.deadlineDate}
                            onChange={(e) => handleUpdateInstallment(index, 'deadlineDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveInstallment(index)}
                          className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center p-4 bg-slate-100 rounded-lg border border-slate-200 mt-4">
                      <span className="font-semibold text-slate-700">Total Percentage (Initial + Installments):</span>
                      <span className={`font-bold ${initialPaymentPercentage + installments.reduce((sum, inst) => sum + Number(inst.percentage), 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {initialPaymentPercentage + installments.reduce((sum, inst) => sum + Number(inst.percentage), 0)}%
                      </span>
                    </div>
                  </div>
                )}
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
