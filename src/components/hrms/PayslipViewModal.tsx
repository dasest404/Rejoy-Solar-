import React from 'react';
import { Payslip } from '../../types/solar';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Sun, Building2, Calendar, CreditCard, Hash, UserCheck } from 'lucide-react';

interface PayslipViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: Payslip | null;
  onEdit?: (payslip: Payslip) => void;
}

// Convert numbers to Indian currency words
function numberToIndianWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  };

  let n = Math.floor(num);
  let str = '';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  if (crore > 0) str += inWords(crore) + 'Crore ';
  if (lakh > 0) str += inWords(lakh) + 'Lakh ';
  if (thousand > 0) str += inWords(thousand) + 'Thousand ';
  if (hundred > 0) str += inWords(hundred);

  return str.trim() + ' Rupees Only';
}

export const PayslipViewModal: React.FC<PayslipViewModalProps> = ({
  isOpen,
  onClose,
  payslip,
  onEdit
}) => {
  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payslip-view-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50/90 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-800">
              Payslip Document • {payslip.payslipNumber}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                payslip.status === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {payslip.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(payslip);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Edit Slip
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 sm:p-10 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 print:p-6 print:overflow-visible">
          {/* Company Branding Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                <Sun className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-950">
                  SOLARPULSE EPC SOLUTIONS PVT. LTD.
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Leading Solar Rooftop & Industrial Utility EPC Contractors
                </p>
                <p className="text-[11px] text-slate-500">
                  Plot 14-A, GIDC Industrial Estate, Sanand, Ahmedabad, Gujarat 382110
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
              <p className="font-mono text-slate-700">
                <strong>GSTIN:</strong> 24AABCS1429B1Z8
              </p>
              <p className="font-mono text-slate-700">
                <strong>CIN:</strong> U40106GJ2020PTC112345
              </p>
              <p className="text-slate-500">hr.payroll@solarpulse.com</p>
            </div>
          </div>

          {/* Payslip Header & Period */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 block">
                Official Salary Slip Voucher
              </span>
              <h2 id="payslip-view-title" className="text-base font-bold text-slate-900">
                PAYSLIP FOR {payslip.month.toUpperCase()}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-mono font-bold text-slate-800">
                Voucher Ref: {payslip.payslipNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Generated Date: {payslip.generatedDate}
              </p>
            </div>
          </div>

          {/* Employee Summary Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-xl bg-white text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Employee Name</span>
              <p className="font-bold text-slate-900">{payslip.employeeName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Employee Code</span>
              <p className="font-mono font-bold text-slate-800">{payslip.employeeCode}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department</span>
              <p className="font-semibold text-slate-800">{payslip.department}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Designation</span>
              <p className="font-semibold text-slate-800">{payslip.designation}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Salary Period</span>
              <p className="font-medium text-slate-800">{payslip.month}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Disbursement Mode</span>
              <p className="font-medium text-slate-800">{payslip.paymentMode || 'NEFT / RTGS'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Bank / UTR Ref</span>
              <p className="font-mono text-slate-800">{payslip.bankReferenceNo || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Payment Status</span>
              <span className="inline-block font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                {payslip.status}
              </span>
            </div>
          </div>

          {/* Side-by-Side Breakdown: Earnings vs. Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Earnings (Fixed & Variable)
                  </span>
                  <span className="text-xs font-bold text-slate-800">Amount (₹)</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Fixed Basic Monthly Salary */}
                  <div className="px-4 py-2.5 flex justify-between items-center bg-amber-50/20">
                    <div>
                      <span className="font-bold text-slate-900">Basic Monthly Salary</span>
                      <span className="text-[10px] text-slate-500 block">Fixed Base Rate</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{payslip.baseSalary.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Overtime */}
                  <div className="px-4 py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800">Overtime Salary</span>
                      <span className="text-[10px] text-slate-500 block">
                        {payslip.overtimeType === 'CALCULATED'
                          ? `${payslip.overtimeHours ?? 0} hrs @ ₹${payslip.overtimeRatePerHour ?? 0}/hr`
                          : 'Direct Overtime'}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-700">
                      ₹{payslip.overtimeAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Additional Expenses */}
                  {payslip.additionalExpenses && payslip.additionalExpenses.length > 0 ? (
                    payslip.additionalExpenses.map((exp, i) => (
                      <div key={exp.id || i} className="px-4 py-2.5 flex justify-between items-center">
                        <div>
                          <span className="text-slate-800">{exp.description}</span>
                          <span className="text-[10px] text-sky-600 block">Approved Reimbursement</span>
                        </div>
                        <span className="font-medium text-slate-800">₹{exp.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-[11px] text-slate-400 italic">
                      No additional expenses claimed
                    </div>
                  )}
                </div>
              </div>

              {/* Total Gross Earnings */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 uppercase">Gross Earnings</span>
                <span className="text-sm font-black text-slate-950">
                  ₹{payslip.grossEarnings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Right: Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Deductions (Statutory & Adjustments)
                  </span>
                  <span className="text-xs font-bold text-slate-800">Amount (₹)</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {payslip.deductions && payslip.deductions.length > 0 ? (
                    payslip.deductions.map((ded, i) => (
                      <div key={ded.id || i} className="px-4 py-2.5 flex justify-between items-center">
                        <div>
                          <span className="text-slate-800">{ded.description}</span>
                          <span className="text-[10px] text-rose-600 block">Payroll Deduction</span>
                        </div>
                        <span className="font-medium text-rose-700">₹{ded.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-slate-400 italic">
                      Zero deductions applied for this pay cycle
                    </div>
                  )}
                </div>
              </div>

              {/* Total Deductions */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 uppercase">Total Deductions</span>
                <span className="text-sm font-black text-rose-700">
                  -₹{payslip.totalDeductions.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Net Payable Highlight Card */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Net Salary Payable (Gross Earnings - Total Deductions)
              </span>
              <p className="text-xs text-slate-300 font-medium italic mt-0.5">
                Amount in Words: <strong>{numberToIndianWords(payslip.netPay)}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 uppercase font-bold block">Net Pay</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                ₹{payslip.netPay.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Signatures & Verification Seal */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-600 border-t border-slate-200">
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 flex items-center justify-center font-serif text-slate-400 italic text-[11px]">
                Rahul Sharma (HR Lead)
              </div>
              <p className="mt-2 font-bold text-slate-800">Prepared By</p>
              <p className="text-[10px] text-slate-400">HR & Payroll Dept</p>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-300 flex items-center justify-center font-serif text-slate-400 italic text-[11px]">
                Sneha Kulkarni (Finance Head)
              </div>
              <p className="mt-2 font-bold text-slate-800">Verified & Approved By</p>
              <p className="text-[10px] text-slate-400">Chief Accountant</p>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-300 flex items-center justify-center font-serif text-slate-400 italic text-[11px]">
                {payslip.employeeName}
              </div>
              <p className="mt-2 font-bold text-slate-800">Employee Signature</p>
              <p className="text-[10px] text-slate-400">Acknowledged & Received</p>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-4 print:pt-6">
            This is an authentic system-generated computer payroll voucher from SolarPulse ERP. All calculations adhere to company payroll policy and Indian labor statutory norms.
          </p>
        </div>
      </div>
    </div>
  );
};
