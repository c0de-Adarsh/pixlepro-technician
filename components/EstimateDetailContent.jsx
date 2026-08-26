import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  ChevronDown,
  Send,
  Plus,
  BookOpen,
  Upload,
  Pencil,
  GripVertical,
  History,
  FileText,
  Phone,
  MessageSquare,
  Paperclip,
  CreditCard,
  PenTool,
  Info,
} from "lucide-react";
import EditEstimateItemModal from "./EditEstimateItemModal";
import AddEstimateItemModal from "./AddEstimateItemModal";

export default function EstimateDetailContent({ estimateId = "1634" }) {
  const router = useRouter();
  const [status, setStatus] = useState("Pending");
  const [taxRate, setTaxRate] = useState("Alberta (5.0%)");
  const [estimateName, setEstimateName] = useState("Calgary Commercial");
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const [items, setItems] = useState([
    {
      id: "item_1",
      name: "Hikvision IP turret camera",
      desc: "6 IP cameras with NVR 2TB HDD upto 8mp processing red/blue siren light intrusion alarm detection 2 way audio",
      badges: ["PRODUCT", "TAXABLE"],
      quantity: "1.00",
      price: "975.00",
      cost: "0.00",
      amount: "975.00",
      taxable: "Yes",
    },
    {
      id: "item_2",
      name: "Junction box",
      desc: "standard junction box per camera/housing unit.",
      badges: ["PRODUCT", "TAXABLE"],
      quantity: "6.00",
      price: "49.99",
      cost: "0.00",
      amount: "299.94",
      taxable: "Yes",
    },
    {
      id: "item_3",
      name: "Cat6 cable",
      desc: "2 spools required - outdoor rated PVC shielded",
      badges: ["PRODUCT", "TAXABLE"],
      quantity: "2.00",
      price: "178.00",
      cost: "0.00",
      amount: "356.00",
      taxable: "Yes",
    },
  ]);

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = (updatedItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 dark:bg-[#0A1625] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/clients")}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#D31010] transition-colors cursor-pointer mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to clients</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Client: Bonnie Smith
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => toast.info("Actions menu opened")}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => toast.success("Estimate sent to client!")}
            className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="text-xs font-semibold text-slate-400">Bill to:</div>
          <div className="font-bold text-slate-900 dark:text-white text-sm">
            68 Wood Crescent SW, Calgary, Alberta T2W 4B6
          </div>
          <div>Calgary, Alberta T2W 4B6</div>
          <div>(403) 680-8780</div>
          <a
            href="mailto:bonniesmith640@shaw.ca"
            className="text-[#D31010] hover:underline font-semibold block"
          >
            bonniesmith640@shaw.ca
          </a>
        </div>

        <div className="space-y-2 text-xs text-right min-w-[240px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-semibold">Estimate:</span>
            <span className="font-bold text-slate-900 dark:text-white">{estimateId}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-semibold">Estimate name:</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-900 dark:text-white">{estimateName}</span>
              <button
                type="button"
                onClick={() => {
                  const newName = prompt("Edit Estimate Name:", estimateName);
                  if (newName) setEstimateName(newName);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-semibold">Date:</span>
            <span className="font-bold text-[#D31010]">Mon Aug 17 2026</span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-slate-400 font-semibold">Status:</span>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="pl-3 pr-7 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold appearance-none cursor-pointer focus:outline-none"
              >
                <option value="Pending">● Pending</option>
                <option value="Approved">● Approved</option>
                <option value="Declined">● Declined</option>
                <option value="Won">● Won</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-700 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Items</span>
                <span className="text-slate-400 text-xs">↕</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2 px-2 w-8"></th>
                    <th className="py-2 px-2">ITEM</th>
                    <th className="py-2 px-2 text-right">QUANTITY</th>
                    <th className="py-2 px-2 text-right">PRICE</th>
                    <th className="py-2 px-2 text-right">COST</th>
                    <th className="py-2 px-2 text-right">AMOUNT</th>
                    <th className="py-2 px-2">TAXABLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEditItem(item)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-2 text-slate-300" onClick={(e) => e.stopPropagation()}>
                        <GripVertical className="w-4 h-4 cursor-grab" />
                      </td>

                      <td className="py-3 px-2 max-w-[280px]">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-normal leading-relaxed">
                          {item.desc}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                            PRODUCT
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
                            TAXABLE
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-right font-semibold">{item.quantity}</td>
                      <td className="py-3 px-2 text-right font-semibold">${item.price}</td>
                      <td className="py-3 px-2 text-right font-semibold">${item.cost}</td>
                      <td className="py-3 px-2 text-right font-extrabold text-slate-900 dark:text-white">
                        ${item.amount}
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">
                        {item.taxable}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(true)}
                className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add item</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info("Opening Price Book...")}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Price book</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Notes</span>
              </h3>
            </div>
            <div className="space-y-2 py-1">
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => toast.info("Add Note clicked")}
                className="text-xs font-semibold text-[#D31010] hover:underline cursor-pointer"
              >
                (+Add)
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>Attachments</span>
              </h3>
              <button
                type="button"
                onClick={() => toast.success("File upload opened")}
                className="px-4 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-[#D31010] flex items-center justify-center">
                <Paperclip className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-[#D31010] hover:underline cursor-pointer">
                + Upload files
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Subtotal :</span>
              <span className="font-extrabold text-slate-900 dark:text-white">3,370.92</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <span>Discount:</span>
                <Info className="w-3 h-3 text-slate-400" />
              </span>
              <input
                type="text"
                defaultValue="0.00"
                className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-semibold text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Tip :</span>
              <input
                type="text"
                defaultValue="0.00"
                className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-semibold text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Taxable :</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">283.99</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Tax rate% :</span>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="Alberta (5.0%)">Alberta (5.0%)</option>
                <option value="Ontario (13.0%)">Ontario (13.0%)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Tax :</span>
              <span className="font-bold text-slate-900 dark:text-white">168.55</span>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-2" />

            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span>Item cost :</span>
              <span>120.00</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Deposit :</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">1,238.81 (35.00%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <span>Labor cost :</span>
                <Info className="w-3 h-3 text-slate-400" />
              </span>
              <input
                type="text"
                defaultValue="0.00"
                className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-semibold text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total :</span>
              <span>298.19</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>With optional :</span>
              <span>3539.47</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Deposits</span>
              </h3>
              <button
                type="button"
                onClick={() => toast.success("Add payment clicked")}
                className="px-3.5 py-1 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
              >
                Add payment
              </button>
            </div>

            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-slate-400">+ Add payments</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-slate-400" />
                <span>Signatures</span>
              </h3>
              <button
                type="button"
                onClick={() => toast.info("Sign signature clicked")}
                className="px-3.5 py-1 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
              >
                Sign
              </button>
            </div>

            <div className="text-xs text-slate-400 py-2">
              No signatures found
            </div>
          </div>
        </div>
      </div>

      <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-l-2xl shadow-xl p-2 flex flex-col items-center gap-4 z-40">
        <button
          type="button"
          onClick={() => toast.info("History clicked")}
          className="p-2 text-slate-400 hover:text-[#D31010] transition-colors cursor-pointer"
        >
          <History className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => toast.info("Activity log clicked")}
          className="p-2 text-slate-400 hover:text-[#D31010] transition-colors cursor-pointer"
        >
          <FileText className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => toast.info("Call clicked")}
          className="p-2 text-slate-400 hover:text-[#D31010] transition-colors cursor-pointer"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => toast.info("Message clicked")}
          className="p-2 text-slate-400 hover:text-[#D31010] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      <EditEstimateItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        itemData={editingItem}
        onSave={handleSaveItem}
      />

      <AddEstimateItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={(newItem) => setItems((prev) => [...prev, newItem])}
      />
    </div>
  );
}
