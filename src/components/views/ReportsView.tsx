import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storage';
import { exportToCSV } from '../../services/exportImport';
import {
  BarChart3,
  Download,
  TrendingUp,
  SunMedium,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { showToast, refreshTrigger } = useApp();
  const projects = useMemo(() => storageService.getProjects(), [refreshTrigger]);
  const payments = useMemo(() => storageService.getPayments(), [refreshTrigger]);
  const expenses = useMemo(() => storageService.getExpenses(), [refreshTrigger]);

  const totalCapacity = projects.reduce((s, p) => s + p.capacityKw, 0);
  const totalValue = projects.reduce((s, p) => s + p.totalValue, 0);
  const totalInflow = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalOutflow = expenses.reduce((s, e) => s + e.amount, 0);

  const capacityByCustomer = projects.map(p => ({
    name: p.customerName.slice(0, 14),
    capacity: p.capacityKw,
    valueLakh: p.totalValue / 100000
  }));

  const handleExportFullReport = () => {
    const headers = ['Project Code', 'Customer', 'Capacity (kW)', 'Value (INR)', 'Stage', 'Progress (%)'];
    const rows = projects.map(p => [
      p.projectCode,
      p.customerName,
      p.capacityKw,
      p.totalValue,
      p.currentStageKey,
      p.progressPercentage
    ]);
    exportToCSV(`SolarPulse_Executive_Report_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    showToast('Executive report downloaded as CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Executive Analytics
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Turnkey EPC Portfolio Metrics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Operational & Financial Reports
          </h1>
        </div>

        <button
          onClick={handleExportFullReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Executive Report</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Portfolio Size</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {(totalCapacity / 1000).toFixed(2)} MW
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{projects.length} sites in Gujarat & MH</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Gross Booking Value</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{(totalValue / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Average ₹42-48/Wp turnkey</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Realized Revenue</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{(totalInflow / 100000).toFixed(1)} Lakh
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Milestones cleared via bank</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Gross Project Margin</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            ₹{((totalInflow - totalOutflow) / 100000).toFixed(1)} Lakh
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Net realized cash surplus</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Contract Capacity Distribution by Client Site</h3>
        <p className="text-xs text-slate-500 mb-4">Capacity (kW) vs Contract Value (₹ Lakhs)</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capacityByCustomer} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="capacity" name="Capacity (kW)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="valueLakh" name="Value (₹ Lakh)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
