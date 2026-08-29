import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Search, FileText } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddInvoiceModal({ isOpen, onClose, onInvoiceCreated }) {
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobId, setJobId] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const [lineItems, setLineItems] = useState([
    { name: "TV Installation Service", qty: 1, price: 189.99, taxable: true },
  ]);
  const [taxRate, setTaxRate] = useState(5.0);
  const [status, setStatus] = useState("Due");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientsList, setClientsList] = useState([]);
  const [priceBookItems, setPriceBookItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchPriceBook();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const res = await Api("GET", "api/clients", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setClientsList(list);
    } catch (e) {}
  };

  const fetchPriceBook = async () => {
    try {
      const res = await Api("GET", "api/price-book", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setPriceBookItems(list);
    } catch (e) {}
  };

  const handleSelectClient = (e) => {
    const cName = e.target.value;
    setClientName(cName);
    const found = clientsList.find((c) => `${c.first_name || ""} ${c.last_name || ""}`.trim() === cName || c.company_name === cName);
    if (found) {
      setCompanyName(found.company_name || "");
      setEmail(found.email || "");
      setPhone(found.phone || "");
    }
  };

  const handleAddItem = () => {
    setLineItems([...lineItems, { name: "New Item", qty: 1, price: 0, taxable: true }]);
  };

  const handleRemoveItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const next = [...lineItems];
    next[index][field] = value;
    setLineItems(next);
  };

  const subtotal = lineItems.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.qty || 1)), 0);
  const taxAmount = Number((subtotal * (Number(taxRate) / 100)).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error("Please enter or select a client name");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        client_name: clientName.trim(),
        company_name: companyName.trim(),
        client_email: email.trim(),
        phone: phone.trim(),
        job_id: jobId.trim(),
        invoice_name: invoiceName.trim() || `Invoice for ${clientName.trim()}`,
        line_items: lineItems.map((item) => ({
          name: item.name,
          qty: Number(item.qty) || 1,
          price: Number(item.price) || 0,
          taxable: item.taxable !== false,
        })),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        amount_due: status === "Paid" ? 0 : totalAmount,
        status,
      };

      const res = await Api("POST", "api/invoices", payload, router);
      if (res && (res.success || res.data)) {
        toast.success(`Invoice #${res.data?.invoice_number || ""} created successfully!`);
        if (onInvoiceCreated) {
          onInvoiceCreated(res.data);
        }
        onClose();
      } else {
        toast.error(res?.message || "Failed to create invoice");
      }
    } catch (err) {
      toast.error("Error creating invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D31010]/10 text-[#D31010] flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Invoice</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="clients-datalist"
                    placeholder="e.g. Unees / Antonio"
                    value={clientName}
                    onChange={handleSelectClient}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden focus:border-[#D31010]"
                  />
                  <datalist id="clients-datalist">
                    {clientsList.map((c, i) => (
                      <option
                        key={i}
                        value={`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.company_name}
                      />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. ARC Financial"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden focus:border-[#D31010]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden focus:border-[#D31010]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden focus:border-[#D31010]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Linked Job ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1067 / 889"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden focus:border-[#D31010]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden focus:border-[#D31010]"
                >
                  <option value="Due">Due</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Draft">Draft</option>
                  <option value="Waiting for QuickBooks">Waiting for QuickBooks</option>
                </select>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Line Items
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-[#D31010] hover:text-[#b00d0d] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                      className="w-16 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden text-center"
                    />
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden text-right"
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax (5%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
