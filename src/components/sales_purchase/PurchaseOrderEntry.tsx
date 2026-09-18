import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { PurchaseOrder, PurchaseOrderItem, Vendor, ProductItem, SolarProject } from '../../types/solar';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  PackagePlus,
  DollarSign,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

export const PurchaseOrderEntry: React.FC = () => {
  const { refreshTrigger, triggerRefresh, showToast } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  // Form states
  const [formVendorId, setFormVendorId] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [formExpectedDate, setFormExpectedDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [formPaymentStatus, setFormPaymentStatus] = useState<PurchaseOrder['paymentStatus']>('UNPAID');
  const [formPaymentDueDate, setFormPaymentDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [formInvoiceRef, setFormInvoiceRef] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Line items state
  const [lineItems, setLineItems] = useState<Omit<PurchaseOrderItem, 'id'>[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);
  const [itemTaxRate, setItemTaxRate] = useState<number>(12);

  const orders = useMemo(() => storageService.getPurchaseOrders(), [refreshTrigger]);
  const vendors = useMemo(() => storageService.getVendors(), [refreshTrigger]);
  const products = useMemo(() => storageService.getProducts(), [refreshTrigger]);
  const projects = useMemo(() => storageService.getProjects(), [refreshTrigger]);

  const metrics = useMemo(() => {
    const totalPurchases = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingDeliveries = orders.filter(o => o.status === 'ORDERED').length;
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED').length;
    const totalPendingPayment = orders
      .filter(o => o.paymentStatus !== 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { totalPurchases, pendingDeliveries, receivedOrders, totalPendingPayment };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        o.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.projectTitle && o.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // When a product is chosen in line items builder
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setItemUnitPrice(prod.unitPrice);
      if (prod.preferredVendorId && !formVendorId) {
        setFormVendorId(prod.preferredVendorId);
      }
    }
  };

  const handleAddLineItem = () => {
    if (!selectedProductId) {
      showToast('Please select a product from catalog', 'warning');
      return;
    }
    if (itemQty <= 0 || itemUnitPrice <= 0) {
      showToast('Quantity and Unit Price must be greater than 0', 'warning');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const baseAmount = itemQty * itemUnitPrice;
    const taxAmt = (baseAmount * itemTaxRate) / 100;
    const totalAmt = baseAmount + taxAmt;

    const newItem: Omit<PurchaseOrderItem, 'id'> = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      category: prod.category,
      quantity: itemQty,
      unit: prod.unit,
      unitPrice: itemUnitPrice,
      taxRatePercent: itemTaxRate,
      taxAmount: taxAmt,
      totalPrice: totalAmt
    };

    setLineItems(prev => [...prev, newItem]);
    setSelectedProductId('');
    setItemQty(10);
    setItemUnitPrice(0);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const formSubtotal = useMemo(() => {
    return lineItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  }, [lineItems]);

  const formTaxTotal = useMemo(() => {
    return lineItems.reduce((acc, it) => acc + it.taxAmount, 0);
  }, [lineItems]);

  const formGrandTotal = formSubtotal + formTaxTotal;

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formVendorId) {
      showToast('Please select a vendor', 'warning');
      return;
    }

    if (lineItems.length === 0) {
      showToast('Please add at least one line item to the purchase order', 'warning');
      return;
    }

    const vendor = vendors.find(v => v.id === formVendorId);
    const project = projects.find(p => p.id === formProjectId);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      purchaseNumber: `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      vendorId: formVendorId,
      vendorName: vendor?.name || 'Authorized Supplier',
      purchaseDate: formPurchaseDate,
      expectedDeliveryDate: formExpectedDate,
      projectId: formProjectId || undefined,
      projectTitle: project?.title || undefined,
      items: lineItems.map((it, idx) => ({
        ...it,
        id: `poi-${Date.now()}-${idx}`
      })) as PurchaseOrderItem[],
      subtotal: formSubtotal,
      taxAmount: formTaxTotal,
      totalAmount: formGrandTotal,
      status: 'ORDERED',
      paymentStatus: formPaymentStatus,
      paymentDueDate: formPaymentDueDate,
      invoiceReference: formInvoiceRef,
      notes: formNotes,
      stockUpdated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.savePurchaseOrder(newPO, false);
    triggerRefresh();
    showToast(`Purchase Order ${newPO.purchaseNumber} submitted to ${newPO.vendorName}`, 'success');
    setIsCreateModalOpen(false);

    // Reset form
    setFormVendorId('');
    setFormProjectId('');
    setLineItems([]);
    setFormNotes('');
  };

  // 1-Click Receive Goods & Synchronize Stock
  const handleReceiveGoods = (order: PurchaseOrder) => {
    storageService.receivePurchaseOrder(order.id, currentUser?.name || 'Store Incharge');
    triggerRefresh();
    showToast(
      `Goods Received! Added quantities for ${order.items.length} items to Warehouse inventory`,
      'success'
    );
  };

  const handleDeletePO = (id: string, poNum: string) => {
    if (window.confirm(`Are you sure you want to delete purchase order ${poNum}?`)) {
      storageService.deletePurchaseOrder(id);
      triggerRefresh();
      showToast(`Purchase Order ${poNum} deleted`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Purchase Value
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
            ₹{metrics.totalPurchases.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {orders.length} orders
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deliveries In Transit
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-700 mt-2 font-mono">
            {metrics.pendingDeliveries} Orders
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Pending physical site receipt
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stock Synchronized
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-2 font-mono">
            {metrics.receivedOrders} Received
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Added to warehouse inventory
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Vendor Payables
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-700 mt-2 font-mono">
            ₹{metrics.totalPendingPayment.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Unpaid vendor balances
          </span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            Purchase Entry & Orders
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Create procurement purchase orders and 1-click receive goods directly into warehouse stock.
          </p>
        </div>

        <button
          id="btn-create-po"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Purchase Entry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO #, vendor, project..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['ALL', 'ORDERED', 'RECEIVED', 'DRAFT'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Vendor</th>
                <th className="p-3.5">Linked Project</th>
                <th className="p-3.5">PO Date</th>
                <th className="p-3.5">Expected Delivery</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Inventory Inflow</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-amber-600 whitespace-nowrap">
                    {order.purchaseNumber}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{order.vendorName}</td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate">
                    {order.projectTitle || <span className="text-slate-400 italic">Central Stock</span>}
                  </td>
                  <td className="p-3.5 text-slate-600 whitespace-nowrap">{order.purchaseDate}</td>
                  <td className="p-3.5 text-slate-600 whitespace-nowrap">
                    {order.expectedDeliveryDate}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.status === 'RECEIVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'ORDERED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    {order.stockUpdated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Stock Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleReceiveGoods(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded border border-amber-200 transition-colors shadow-2xs"
                      >
                        <PackagePlus className="w-3 h-3" />
                        Receive & Add Stock
                      </button>
                    )}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingPO(order)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View PO Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePO(order.id, order.purchaseNumber)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete PO"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                    No purchase orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Purchase Entry */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Create Purchase Order Entry</h3>
                  <p className="text-xs text-slate-500">
                    Procure equipment and solar components from authorized manufacturers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePO} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Vendor & Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Vendor *
                  </label>
                  <select
                    required
                    value={formVendorId}
                    onChange={e => setFormVendorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category} - {v.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct Site Project Allocation (Optional)
                  </label>
                  <select
                    value={formProjectId}
                    onChange={e => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">-- Central Warehouse Stock --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.customerName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={formPurchaseDate}
                    onChange={e => setFormPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formExpectedDate}
                    onChange={e => setFormExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vendor Invoice / Challan Ref
                  </label>
                  <input
                    type="text"
                    value={formInvoiceRef}
                    onChange={e => setFormInvoiceRef(e.target.value)}
                    placeholder="e.g. WAA-INV-998"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Purchase Order Line Items
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Product Catalog Item *
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={e => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">-- Select Product to Order --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={e => setItemQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Unit Purchase Cost (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={itemUnitPrice}
                      onChange={e => setItemUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">GST (12/18%)</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lineItems.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-800">
                            <div>{it.productName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{it.sku}</span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            ₹{it.unitPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2.5 text-right font-mono text-purple-700">
                            ₹{it.taxAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                            ₹{it.totalPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {lineItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                            No items added. Select a product above to add to PO.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {lineItems.length > 0 && (
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-xs">
                        <tr>
                          <td colSpan={4} className="p-2 text-right text-slate-600">
                            Subtotal:
                          </td>
                          <td className="p-2 text-right font-mono">
                            ₹{formSubtotal.toLocaleString('en-IN')}
                          </td>
                          <td></td>
                        </tr>
                        <tr className="border-t border-slate-300 text-sm font-bold bg-amber-50">
                          <td colSpan={4} className="p-2.5 text-right text-amber-900">
                            Grand Total (with Tax):
                          </td>
                          <td className="p-2.5 text-right font-mono text-amber-900">
                            ₹{formGrandTotal.toLocaleString('en-IN')}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Procurement Notes / Dispatch Instructions
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Delivery address, unloading crane requirement, test certificates..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Confirm & Place PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View PO Details */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono">
                  {viewingPO.purchaseNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Purchase Order Summary</h3>
              </div>
              <button onClick={() => setViewingPO(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Vendor</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">
                  {viewingPO.vendorName}
                </span>
                {viewingPO.invoiceReference && (
                  <span className="text-slate-600 block mt-1">
                    Invoice Ref: {viewingPO.invoiceReference}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Date:</span>
                  <span className="font-semibold text-slate-800">{viewingPO.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-blue-700">{viewingPO.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stock Updated:</span>
                  <span className="font-semibold text-emerald-700">
                    {viewingPO.stockUpdated ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">GST</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingPO.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium text-slate-800">{item.productName}</td>
                      <td className="p-2.5 text-center font-bold text-slate-700">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-600">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-mono text-purple-700">
                        ₹{item.taxAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm font-bold bg-amber-50 p-3 rounded-xl">
              <span className="text-amber-900">Total Purchase Amount:</span>
              <span className="text-amber-900 font-mono">
                ₹{viewingPO.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-end gap-2">
              {!viewingPO.stockUpdated && (
                <button
                  onClick={() => {
                    handleReceiveGoods(viewingPO);
                    setViewingPO(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Receive Goods & Add Stock
                </button>
              )}
              <button
                onClick={() => setViewingPO(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
