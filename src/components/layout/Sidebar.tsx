import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileSpreadsheet,
  SunMedium,
  Layers,
  CreditCard,
  UserSquare2,
  Wrench,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeView, setActiveView, setStageFilterKey } = useApp();
  const { currentUser, isCustomer, canAccessModule } = useAuth();

  const [crmOpen, setCrmOpen] = useState(true);
  const [salesPurchaseOpen, setSalesPurchaseOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  const navigateTo = (view: AppView, stageKey?: string) => {
    if (stageKey) {
      setStageFilterKey(stageKey);
      setActiveView('projects_stage_filtered');
    } else {
      setActiveView(view);
    }
    onCloseMobile();
  };

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all select-none ${
      isActive
        ? 'bg-amber-500 text-white shadow-xs font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const subNavItemClass = (isActive: boolean) =>
    `flex items-center justify-between pl-9 pr-3 py-2 rounded-lg text-xs transition-colors select-none ${
      isActive
        ? 'text-amber-700 bg-amber-50 font-bold'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 overflow-y-auto transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3.5 space-y-6">
          {/* If customer role, only show Customer Portal options */}
          {isCustomer ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Client Portal Access
              </div>
              <button
                onClick={() => navigateTo('customer_portal')}
                className={navItemClass(activeView === 'customer_portal')}
              >
                <SunMedium className="w-4 h-4" />
                <span>My Solar Project</span>
              </button>
              <button
                onClick={() => navigateTo('customer_control_center')}
                className={navItemClass(activeView === 'customer_control_center')}
              >
                <Layers className="w-4 h-4" />
                <span>Project Timeline & Docs</span>
              </button>
              <button
                onClick={() => navigateTo('service')}
                className={navItemClass(activeView === 'service')}
              >
                <Wrench className="w-4 h-4" />
                <span>Service & Support</span>
              </button>
            </div>
          ) : (
            <>
              {/* Primary Section */}
              <div className="space-y-1">
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={navItemClass(activeView === 'dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                {/* Heart of the System: Customer Control Center */}
                <button
                  onClick={() => navigateTo('customer_control_center')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    activeView === 'customer_control_center'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white border-transparent shadow-xs font-bold'
                      : 'border-amber-200/90 bg-amber-50/60 text-amber-900 hover:bg-amber-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-amber-500 group-hover:text-amber-600" />
                    <span>Control Center</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide font-black ${
                    activeView === 'customer_control_center' ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-900'
                  }`}>
                    Core Hub
                  </span>
                </button>
              </div>

              {/* CRM Section */}
              {canAccessModule('crm') && (
                <div className="space-y-1">
                  <div
                    onClick={() => setCrmOpen(!crmOpen)}
                    className="flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600"
                  >
                    <span>CRM & Sales</span>
                    {crmOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>

                  {crmOpen && (
                    <div className="space-y-0.5">
                      <button
                        onClick={() => navigateTo('crm_leads')}
                        className={subNavItemClass(activeView === 'crm_leads')}
                      >
                        <span>Leads Pipeline</span>
                      </button>
                      <button
                        onClick={() => navigateTo('crm_customers')}
                        className={subNavItemClass(activeView === 'crm_customers')}
                      >
                        <span>Customer Directory</span>
                      </button>
                      <button
                        onClick={() => navigateTo('crm_quotations')}
                        className={subNavItemClass(activeView === 'crm_quotations')}
                      >
                        <span>Quotations & Proposals</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sales & Purchase Section */}
              {canAccessModule('sales_purchase') && (
                <div className="space-y-1">
                  <div
                    onClick={() => {
                      navigateTo('sales_purchase');
                      setSalesPurchaseOpen(true);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      [
                        'sales_purchase',
                        'sales_bom',
                        'sales_invoices',
                        'purchase_vendors',
                        'purchase_orders',
                        'inventory_products',
                        'inventory_stock'
                      ].includes(activeView)
                        ? 'bg-amber-500/10 text-amber-900 border border-amber-300/60'
                        : 'text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-500" />
                      <span>Sales & Purchase</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSalesPurchaseOpen(!salesPurchaseOpen);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      aria-label="Toggle Sales & Purchase menu"
                    >
                      {salesPurchaseOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {salesPurchaseOpen && (
                    <div className="space-y-0.5 pl-2 border-l border-amber-200/80 ml-3">
                      <button
                        onClick={() => navigateTo('sales_purchase')}
                        className={subNavItemClass(activeView === 'sales_purchase')}
                      >
                        <span>Hub & Synchronization</span>
                      </button>
                      <button
                        onClick={() => navigateTo('sales_bom')}
                        className={subNavItemClass(activeView === 'sales_bom')}
                      >
                        <span>Bill of Materials (BOM)</span>
                      </button>
                      <button
                        onClick={() => navigateTo('sales_invoices')}
                        className={subNavItemClass(activeView === 'sales_invoices')}
                      >
                        <span>Invoice Creation</span>
                      </button>
                      <button
                        onClick={() => navigateTo('purchase_vendors')}
                        className={subNavItemClass(activeView === 'purchase_vendors')}
                      >
                        <span>Vendor Management</span>
                      </button>
                      <button
                        onClick={() => navigateTo('purchase_orders')}
                        className={subNavItemClass(activeView === 'purchase_orders')}
                      >
                        <span>Purchase Entry</span>
                      </button>
                      <button
                        onClick={() => navigateTo('inventory_products')}
                        className={subNavItemClass(activeView === 'inventory_products')}
                      >
                        <span>Purchased Products</span>
                      </button>
                      <button
                        onClick={() => navigateTo('inventory_stock')}
                        className={subNavItemClass(activeView === 'inventory_stock')}
                      >
                        <span>Inventory & Stock</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Projects & Workflows Section */}
              <div className="space-y-1">
                <div
                  onClick={() => setProjectsOpen(!projectsOpen)}
                  className="flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600"
                >
                  <span>Project Operations</span>
                  {projectsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>

                {projectsOpen && (
                  <div className="space-y-0.5">
                    <button
                      onClick={() => navigateTo('projects_all')}
                      className={subNavItemClass(activeView === 'projects_all')}
                    >
                      <span>All Projects</span>
                    </button>
                    <button
                      onClick={() => navigateTo('projects_stage_filtered', 'site_survey')}
                      className={subNavItemClass(activeView === 'projects_stage_filtered')}
                    >
                      <span>Stage Workflows</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Accounting & Finance */}
              {canAccessModule('finance') && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Finance & Accounts
                  </div>
                  <button
                    onClick={() => navigateTo('finance')}
                    className={navItemClass(activeView === 'finance')}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Invoices & Tally Sync</span>
                  </button>
                </div>
              )}

              {/* HRMS */}
              {canAccessModule('hrms') && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Human Resources
                  </div>
                  <button
                    onClick={() => navigateTo('hrms')}
                    className={navItemClass(activeView === 'hrms')}
                  >
                    <UserSquare2 className="w-4 h-4" />
                    <span>Team, Attendance & GPS</span>
                  </button>
                </div>
              )}

              {/* Service & AMC */}
              {canAccessModule('service') && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Post-Commissioning
                  </div>
                  <button
                    onClick={() => navigateTo('service')}
                    className={navItemClass(activeView === 'service')}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Service & AMC Tickets</span>
                  </button>
                </div>
              )}

              {/* Reports */}
              {canAccessModule('reports') && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Intelligence
                  </div>
                  <button
                    onClick={() => navigateTo('reports')}
                    className={navItemClass(activeView === 'reports')}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics & Reports</span>
                  </button>
                </div>
              )}

              {/* System Settings */}
              {canAccessModule('settings') && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => navigateTo('settings')}
                    className={navItemClass(activeView === 'settings')}
                  >
                    <Settings className="w-4 h-4" />
                    <span>System Settings & Tally</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Quick Info card at bottom of sidebar */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>Firebase Auth</span>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm font-semibold">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Session is secured with Firebase Auth. Operational permissions are enforced across all modules.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
