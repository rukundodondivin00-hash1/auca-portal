import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Globe, Menu } from 'lucide-react';
import { contractApi, paymentApi, studentApi, registrationApi } from '@/lib/api';
import { useSearchParams } from 'react-router';

export default function UrubutoPayPage() {
  const [searchParams] = useSearchParams();
  const hasActiveContract = searchParams.get('hasActiveContract') === 'true';
  const minRequiredAmount = 1000;
  
  const onClose = () => window.close();
  const onPaymentSuccess = () => window.close();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [channel, setChannel] = useState('MOMO');
  const [feeType, setFeeType] = useState('TUITION_FEE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [registration, setRegistration] = useState<any>(null);
  const [termConfig, setTermConfig] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);

  const studentId = localStorage.getItem('student_id') || '';

  useEffect(() => {

    registrationApi.getTerm()
      .then(termRes => {
        const termId = termRes.data?.id;
        if (termId) {
          registrationApi.getMyRegistration(studentId, termId)
            .then(regRes => {
              if (regRes.status === 200 && regRes.data) {
                setRegistration(regRes.data);
                studentApi.getTermConfig(termId)
                  .then(configRes => {
                    if (configRes.data) setTermConfig(configRes.data);
                  })
                  .catch(() => {});
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    paymentApi.getMyBalance(studentId)
      .then(r => r.status === 200 ? r.data : null)
      .then(data => {
        if (data?.data?.totalPaid || data?.totalPaid) {
          setTotalPaid(Number(data.data?.totalPaid || data.totalPaid));
        }
      })
      .catch(() => {});
  }, [studentId]);

  let dynamicMinRequired = minRequiredAmount;
  if (!hasActiveContract && registration && termConfig) {
    const initialPaymentPercentage = termConfig.initialPaymentPercentage !== undefined ? Number(termConfig.initialPaymentPercentage) : 100;
    const totalAmount = registration.totalFee || 0;
    const minRequiredTotal = totalAmount > 0 ? (totalAmount * initialPaymentPercentage / 100) : 0;
    const shortfall = minRequiredTotal - totalPaid;
    if (shortfall > 0) {
      dynamicMinRequired = Math.max(dynamicMinRequired, shortfall);
    }
  }

  const handleInitiatePayment = async () => {
    const amount = Number(paymentAmount);
    if (!amount || amount < dynamicMinRequired) {
      alert(`Minimum payment is ${new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(dynamicMinRequired)}.`);
      return;
    }

    if (!agreed) {
      alert('Please agree to the privacy statements and terms & conditions.');
      return;
    }

    setIsProcessing(true);
    
    // Artificial delay for UI popup showoff
    await new Promise(r => setTimeout(r, 4000));

    try {
      const endpoint = hasActiveContract
        ? '/api/payments/confirm'
        : '/api/payments/pre-payment';

      const body: any = {
        amount,
        channel,
        feeType: 'TUITION_FEE', // Hardcoded to prevent logic breakage
        phoneNumber: phoneNumber || '0780000000'
      };
      if (!hasActiveContract && registration?.termId) {
        body.termId = registration.termId;
      }

      const response = await contractApi.post(endpoint, body);
      const result = response.data;
      const newTotalPaid = result?.data?.totalPaidToDate ?? (totalPaid + amount);
      setTotalPaid(Number(newTotalPaid));

      setPaymentAmount('');
      setPhoneNumber('');
      setAgreed(false);
      onClose();
      onPaymentSuccess?.();
    } catch (error: any) {
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <div className="bg-[#f5f5f5] flex flex-col font-sans min-h-screen w-full">
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-[#2b4c9b] animate-spin mb-6"></div>
            <h2 className="text-xl font-medium text-[#2b4c9b] mb-4">Pending Payment</h2>
            <p className="text-[#2b4c9b] text-center text-[15px] leading-relaxed">
              Thank you for initiating payment, check your pending transaction on *182*7*1# and follow the instruction
            </p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="bg-white px-8 h-20 flex items-center justify-between shrink-0 shadow-sm border-b border-gray-100 min-w-full">
        <div className="flex items-center cursor-pointer" onClick={onClose} title="Click to go back">
          <span className="text-3xl font-black text-[#2b4c9b] tracking-tight">UrubutoPay<span className="text-[#ffcc00] text-4xl leading-3 ml-0.5 relative -top-1 font-serif">'</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button className="bg-[#385eac] text-white px-6 py-2 rounded-md font-medium text-sm">Pay now</button>
          <button className="bg-[#fdf3a4] text-[#b09e25] px-6 py-2 rounded-md font-medium text-sm border border-[#f0e386]">Download Receipts</button>
          <div className="flex items-center gap-1.5 cursor-pointer ml-2 text-[#2b4c9b]">
            <Globe size={24} strokeWidth={1.5} />
            <span className="font-medium text-[15px]">EN</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-[#f5f5f5] flex justify-center items-start pt-12 pb-20 w-full min-h-max">
        <div className="max-w-[1050px] w-full flex gap-6 px-4">
          
          {/* Left Card: Merchant Details */}
          <div className="w-[360px] bg-[#f7f8f9] rounded-2xl p-8 flex flex-col items-center shadow-sm shrink-0">
            <h2 className="text-[#2b4c9b] text-[17px] font-normal mb-12">Merchant Details</h2>
            
            <div className="w-[100px] h-[100px] bg-[#c4c4c4] rounded-full flex items-center justify-center mb-8">
              <span className="text-white text-5xl font-light">A</span>
            </div>
            
            <h3 className="text-center font-bold text-gray-900 text-lg mb-10 leading-tight">Adventist University of<br/>Central Africa</h3>
            
            <div className="text-center mb-6">
              <p className="text-[#2b4c9b] text-[10px] uppercase font-bold tracking-wider mb-1">MERCHANT CODE</p>
              <p className="font-bold text-gray-900 text-[13px]">TH61132546</p>
            </div>
            
            <div className="text-center">
              <p className="text-[#2b4c9b] text-[10px] uppercase font-bold tracking-wider mb-1">PAYER CODE / BILL ID</p>
              <p className="font-bold text-gray-900 text-[13px]">{studentId}</p>
            </div>
          </div>

          {/* Right Card: Form Details */}
          <div className="flex-1 bg-[#f7f8f9] rounded-2xl px-12 py-10 flex flex-col shadow-sm relative min-h-[550px]">
            <div className="text-center text-[#2b4c9b] mb-12 text-[16px]">
              <p>Dear {registration?.studentName || "Student"}</p>
              <p className="mt-1 opacity-90">Please provide the following details and proceed</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <label className="block text-[14px] font-bold text-black mb-2">Services <span className="text-red-600">*</span></label>
                <Select value={feeType} onValueChange={setFeeType}>
                  <SelectTrigger className="w-full h-[46px] bg-white border border-gray-200 rounded-lg text-gray-500 shadow-sm text-[15px]">
                    <SelectValue placeholder="Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUITION_FEE">Tuition fees</SelectItem>
                    <SelectItem value="REGISTRATION_FEE">Registration Fee</SelectItem>
                    <SelectItem value="APPLICATION_FEE">Application Fee</SelectItem>
                    <SelectItem value="MAKEUP_EXAM">Make-up exam</SelectItem>
                    <SelectItem value="STUDENT_ASSOC">Student Association Fee</SelectItem>
                    <SelectItem value="STUDENT_CARD">Student card</SelectItem>
                    <SelectItem value="LIBRARY_CARD">Library card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-black mb-2">Amount (RWF) <span className="text-red-600">*</span></label>
                <Input 
                  type="number"
                  placeholder="Amount"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full h-[46px] bg-white border border-gray-200 rounded-lg shadow-sm text-[15px] placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="text-center mb-10">
              <p className="text-[#2b4c9b] text-[15px] mb-4">Choose a Payment Mode</p>
              <div className="flex justify-center gap-4 mb-6">
                  <button 
                    onClick={() => setChannel('MOMO')} 
                    className={`h-[48px] w-[130px] rounded-lg flex items-center justify-center bg-[#ffcc00] transition-all shadow-sm ${channel === 'MOMO' ? 'ring-2 ring-offset-2 ring-[#ffcc00]' : 'hover:brightness-105'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[26px] h-[26px] bg-[#005587] rounded-sm flex items-center justify-center">
                         <span className="text-white text-[10px] font-bold">MTN</span>
                      </div>
                      <span className="text-[#005587] text-[14px] font-bold leading-tight text-left">MoMo<br/><span className="text-[9px] font-normal">from MTN</span></span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setChannel('AIRTEL')} 
                    className={`h-[48px] w-[130px] rounded-lg flex items-center justify-center bg-[#e3000f] transition-all shadow-sm ${channel === 'AIRTEL' ? 'ring-2 ring-offset-2 ring-[#e3000f]' : 'hover:brightness-105'}`}
                  >
                     <div className="flex items-center gap-1.5 text-white">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                        <span className="text-[15px] font-bold leading-tight text-left">airtel<br/><span className="text-[10px] font-normal block -mt-1">money</span></span>
                     </div>
                  </button>
              </div>
              <div className="text-left">
                <label className="block text-[13px] text-[#2b4c9b] mb-2 font-medium">Mobile Number Eg: 078****90 and make sure that is the number you are going to use to pay</label>
                <Input 
                  type="text"
                  placeholder="07XXXXXXXX"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full h-[46px] bg-white border border-gray-200 rounded-lg shadow-sm text-[15px] placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="mt-auto flex items-start gap-3 justify-center mb-6">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1 w-[16px] h-[16px] rounded border-gray-300 text-[#2b4c9b] focus:ring-[#2b4c9b] cursor-pointer" 
              />
              <span className="text-[14px] text-gray-500 leading-snug max-w-md">
                I have read and constent to UrubutoPay processing my information in accordance with the <span className="text-[#2b4c9b]">Privacy statements</span> and <span className="text-[#2b4c9b]">Terms & conditions</span>
              </span>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleInitiatePayment}
                disabled={!paymentAmount || Number(paymentAmount) < dynamicMinRequired}
                className="bg-[#385eac] text-white px-[44px] py-[10px] rounded-[6px] text-[15px] font-medium disabled:opacity-60 transition-opacity"
              >
                Pay Now
              </button>
            </div>
            
            <button onClick={onClose} title="Close simulated window" className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
