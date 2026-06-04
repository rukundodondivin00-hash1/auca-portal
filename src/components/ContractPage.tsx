import React, { useState } from 'react';
import { Upload, Camera, Download, AlertCircle, FileText, CheckCircle2, Lock, Unlock } from 'lucide-react';

export default function ContractPage() {
  // --- MOCK DATA ---
  const studentName = "Rukundo Don Divin";
  const studentId = "25306";
  const totalAmount = 566103;
  const paymentMade = 220000;
  const remainingBalance = totalAmount - paymentMade;
  const credits = 116;
  const currentDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
  
  // --- STATE ---
  const [month1, setMonth1] = useState<string>('');
  const [month2, setMonth2] = useState<string>('');
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false); // NEW: Tracks if Step 1 is done
  const [hasAccepted, setHasAccepted] = useState(false);

  // --- LOGIC ---
  const sumEntered = (Number(month1) || 0) + (Number(month2) || 0);
  const isAmountsValid = sumEntered === remainingBalance;
  
  // To submit the final PDF, both Step 1 must be confirmed AND terms accepted
  const canSubmit = isPlanConfirmed && hasAccepted;

  const handleAcceptAndDownload = () => {
    if (canSubmit) {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      
      {/* =========================================================
          WEB UI: Visible on screen, hidden when printing as PDF 
          ========================================================= */}
      <div className="max-w-4xl mx-auto space-y-6 pt-6 print:hidden">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Payment Contract Setup
          </h1>
          <p className="text-gray-500 mt-1">Configure your installment plan and sign your official contract.</p>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center text-xl font-bold">
              RD
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{studentName}</h2>
              <p className="text-sm text-gray-500">ID: {studentId} • IT / {credits} Credits</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 flex-1 md:flex-none">
              <p className="text-xs text-gray-500 font-semibold mb-1">Total Fee</p>
              <p className="font-bold text-gray-900">{totalAmount.toLocaleString()} RWF</p>
            </div>
            <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-100 flex-1 md:flex-none">
              <p className="text-xs text-red-600 font-semibold mb-1">Remaining Balance</p>
              <p className="font-bold text-red-700">{remainingBalance.toLocaleString()} RWF</p>
            </div>
          </div>
        </div>

        {/* Installment Plan Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
          <div className={`px-6 py-4 flex justify-between items-center ${isPlanConfirmed ? 'bg-green-700' : 'bg-blue-900'}`}>
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                Step 1: Set Installment Plan
                {isPlanConfirmed && <CheckCircle2 size={18} className="text-green-300" />}
              </h3>
              <p className="text-blue-200 text-sm mt-0.5">Divide your remaining balance across the next two months.</p>
            </div>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">October 30, 2025</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={month1}
                    onChange={(e) => setMonth1(e.target.value)}
                    disabled={isPlanConfirmed}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="e.g. 200000"
                  />
                  <span className="absolute right-4 top-3 text-gray-400 font-semibold">RWF</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">November 31, 2025</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={month2}
                    onChange={(e) => setMonth2(e.target.value)}
                    disabled={isPlanConfirmed}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="e.g. 146103"
                  />
                  <span className="absolute right-4 top-3 text-gray-400 font-semibold">RWF</span>
                </div>
              </div>
            </div>

            {/* Validation Feedback */}
            <div className="mt-4">
              {!isPlanConfirmed && !isAmountsValid && (month1 || month2) && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>Your installments equal <strong>{sumEntered.toLocaleString()} RWF</strong>. They must exactly match the remaining balance of <strong>{remainingBalance.toLocaleString()} RWF</strong>.</span>
                </div>
              )}
            </div>

            {/* Step 1: Submit / Edit Button */}
            <div className="mt-6 flex justify-end border-t border-gray-100 pt-6">
              {!isPlanConfirmed ? (
                <button
                  onClick={() => setIsPlanConfirmed(true)}
                  disabled={!isAmountsValid}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm
                    ${isAmountsValid 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <Lock size={16} />
                  Confirm Installment Plan
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsPlanConfirmed(false);
                    setHasAccepted(false); // Reset step 2 if they edit step 1
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  <Unlock size={16} />
                  Edit Plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Document Uploads (Optional/Live Capture) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 group">
            <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Upload size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">Upload ID Document</p>
              <p className="text-xs text-gray-500">Browse files from device</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 group">
            <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Camera size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">Take Live Photo</p>
              <p className="text-xs text-gray-500">Use device camera</p>
            </div>
          </button>
        </div>

        {/* Terms and Submission */}
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${isPlanConfirmed ? 'border-gray-200 opacity-100' : 'border-gray-100 opacity-50 pointer-events-none'}`}>
          <div className="p-6 bg-gray-50 border-b border-gray-200 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-900 mb-2">Step 2: Review and Accept Terms</p>
            That I <span className="font-bold text-gray-900">{studentName}</span> hereby acknowledge that as of <span className="font-bold text-gray-900">{currentDate}</span>, I registered with the Adventist University of Central Africa in Information Technology with <span className="font-bold text-gray-900">{credits}</span> Credits and I promise to pay the total amount of the school fees on installment payment at the date as specified above.
            <br /><br />
            That I accept and fully understand that tuition and fees paid upon registration is not refundable on whatever reason and that 5% penalty per month on the amount due will be charged on delayed payment.
          </div>
          
          <div className="p-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={hasAccepted}
                  onChange={(e) => setHasAccepted(e.target.checked)}
                  disabled={!isPlanConfirmed}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                I have reviewed the installment plan and agree to the payment terms outlined in the official contract. I understand this serves as my digital signature.
              </span>
            </label>

            <button 
              onClick={handleAcceptAndDownload}
              disabled={!canSubmit}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all shadow-sm
                ${canSubmit 
                  ? 'bg-blue-900 hover:bg-blue-800 cursor-pointer hover:shadow-md' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'}`}
            >
              <Download size={20} />
              Accept Terms & Generate Official Contract PDF
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          PRINT UI: Hidden on screen, visible ONLY when printing
          ========================================================= */}
      <div className="hidden print:block bg-white w-full max-w-[900px] p-0 m-0 font-serif">
        
        {/* HEADER */}
        <div className="flex items-center gap-6 border-b-2 border-gray-800 pb-6 mb-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Adventist_University_of_Central_Africa_logo.png/220px-Adventist_University_of_Central_Africa_logo.png" 
            alt="AUCA Logo" 
            className="w-24 h-24 object-contain grayscale"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide">Adventist University of Central Africa</h1>
            <p className="text-sm text-gray-600 mt-1">P.O. Box 2461 Kigali, Rwanda | www.auca.ac.rw | info@auca.ac.rw</p>
          </div>
        </div>

        {/* TOP INFO */}
        <div className="flex justify-between items-start mb-8 text-sm">
          <div className="space-y-4">
            <p className="font-bold text-lg uppercase">Student ID: <span className="text-black border-b border-dotted border-gray-400 font-normal ml-2 px-2">{studentId}</span></p>
            <p>REGISTRATION PERIOD: ( ) FIRST SEM SECOND SEM: ( ) OTHERS ACADEMIC YEAR: 2025/2026</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="font-bold uppercase tracking-widest text-sm mb-2">Contract of Payment</p>
          <p>NAME: <span className="font-bold text-black border-b border-dotted border-gray-400 px-4 text-lg">{studentName}</span></p>
        </div>

        {/* FINANCIAL TABLE FOR PDF */}
        <div className="mb-8">
          <table className="w-full border-collapse border-2 border-gray-900 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-800 p-2 text-left w-20">Amount</th>
                <th className="border border-gray-800 p-2 text-left">Total to Paid/Ayo ugomba kwishyura</th>
                <th className="border border-gray-800 p-2 text-left">Payment Made/Ayo wishyuye</th>
                <th className="border border-gray-800 p-2 text-left">REMAIN/ASIGAYE</th>
                <th className="border border-gray-800 p-2 text-left">30/10/2025</th>
                <th className="border border-gray-800 p-2 text-left">30/11/2025</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-800 p-3"></td>
                <td className="border border-gray-800 p-3 font-bold">{totalAmount.toLocaleString()}</td>
                <td className="border border-gray-800 p-3">{paymentMade.toLocaleString()}</td>
                <td className="border border-gray-800 p-3 font-bold">{remainingBalance.toLocaleString()}</td>
                <td className="border border-gray-800 p-3 font-bold">{month1 ? Number(month1).toLocaleString() : ''}</td>
                <td className="border border-gray-800 p-3 font-bold">{month2 ? Number(month2).toLocaleString() : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* LEGAL PARAGRAPH */}
        <div className="text-sm leading-relaxed text-justify mb-8">
          That I <span className="font-bold border-b border-dotted border-black px-2">{studentName}</span> hereby acknowledge that as of <span className="font-bold border-b border-dotted border-black px-2">{currentDate}</span>, I registered with the Adventist University of Central Africa in Information Technology with <span className="font-bold border-b border-dotted border-black px-2">{credits}</span> Credits and I promise to pay the total amount of the school fees on installment payment at the date as specified above.
          <br /><br />
          That I accept and fully understand that tuition and fees paid upon registration is not refundable on whatever reason and that 5% penalty per month on the amount due will be charged on delayed payment.
        </div>

        {/* FOOTER SIGNATURES */}
        <div className="flex justify-between items-end mt-24 pt-8">
          <div>
            <p className="font-signature text-2xl text-blue-800 mb-1 -rotate-3 italic">{studentName}</p>
            <p className="text-sm font-bold border-t border-black w-48 pt-2">Student's Digital Signature</p>
            <p className="text-xs text-gray-500 mt-1">TEL: 0784405464</p>
            <p className="text-[10px] text-gray-400 mt-4">Digitally accepted on: {currentDate}</p>
          </div>
          <div className="text-center relative">
            <div className="absolute -top-16 -left-8 w-32 h-32 rounded-full border-4 border-black opacity-30 flex items-center justify-center transform rotate-12">
              <span className="text-[10px] text-black font-bold text-center uppercase tracking-widest">AUCA STUDENT<br/>ACCOUNTS<br/>RWANDA</span>
            </div>
            <p className="text-sm font-bold border-t border-black w-56 pt-2 relative z-10 bg-white">AUCA REPRESENTATIVE</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}