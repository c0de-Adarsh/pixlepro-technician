import React, { useState } from "react";
import { useRouter } from "next/router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import ClientDetailDrawer from "./ClientDetailDrawer";

export default function AgingInvoicesContent() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const agingInvoices = [
    {
      invoiceNo: "73",
      invoiceName: "",
      clientName: "Robert Kennedy",
      clientEmail: "leafslash46@gmail.com",
      total: "$324.47",
      balance: "$324.47",
      dueOn: "Fri Mar 28, 2025",
      created: "Wed Mar 26, 202...",
      daysLate: "514",
    },
    {
      invoiceNo: "79",
      invoiceName: "",
      clientName: "paul anderson",
      clientEmail: "panderson0413@gmail.com",
      total: "$1,969.86",
      balance: "$715.58",
      dueOn: "Thu Mar 27, 2025",
      created: "Thu Mar 27, 2025",
      daysLate: "515",
    },
    {
      invoiceNo: "117",
      invoiceName: "",
      clientName: "santi gomez",
      clientEmail: "santibarichase504@gmail.com",
      total: "$3,800.96",
      balance: "$432.86",
      dueOn: "Wed Apr 09, 202...",
      created: "Wed Apr 09, 202...",
      daysLate: "502",
    },
    {
      invoiceNo: "128",
      invoiceName: "",
      clientName: "Mo gill",
      clientEmail: "info@thetransportguys.com",
      total: "$2,897.99",
      balance: "$1,697.99",
      dueOn: "Tue Apr 15, 2025",
      created: "Tue Apr 15, 2025",
      daysLate: "496",
    },
    {
      invoiceNo: "599",
      invoiceName: "",
      clientName: "adam carey",
      clientEmail: "acarey@br2architecture.com",
      total: "$241.49",
      balance: "$241.49",
      dueOn: "Thu May 07, 2025",
      created: "Wed May 06, 2025",
      daysLate: "475",
    },
    {
      invoiceNo: "312",
      invoiceName: "",
      clientName: "Adeel malik",
      clientEmail: "adeel.arton@gmail.com",
      total: "$325.74",
      balance: "$325.74",
      dueOn: "Sat Nov 15, 2025",
      created: "Sat Nov 15, 2025",
      daysLate: "282",
    },
    {
      invoiceNo: "227",
      invoiceName: "",
      clientName: "Agecare",
      clientEmail: "Zstojadinovic@agecare.ca",
      total: "$120.75",
      balance: "$120.75",
      dueOn: "Tue Aug 05, 2025",
      created: "Tue Aug 05, 2025",
      daysLate: "384",
    },
    {
      invoiceNo: "618",
      invoiceName: "",
      clientName: "Aiden",
      clientEmail: "aidanvogele@gmail.com",
      total: "$146.89",
      balance: "$146.89",
      dueOn: "Thu May 14, 2025",
      created: "Thu May 14, 2025",
      daysLate: "467",
    },
  ];

  const handleOpenClient = (item) => {
    setSelectedClient(item);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-4 sm:pt-6 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span className="hover:text-slate-600 cursor-pointer">ITEMS REPORT</span>
        <span>#</span>
        <span className="hover:text-slate-600 cursor-pointer">TAX REPORT</span>
        <span>#</span>
        <span className="hover:text-slate-600 cursor-pointer">ESTIMATES</span>
        <span>#</span>
        <span className="hover:text-slate-600 cursor-pointer">CLIENT</span>
        <span>#</span>
        <span className="hover:text-slate-600 cursor-pointer">REPORTS</span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">AGING INVOICES</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-[#475569] shadow-sm flex flex-col justify-center space-y-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            $115,399.72
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            227 invoices due
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-amber-400 shadow-sm flex flex-col justify-center space-y-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            $2,704.79
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            under 30 days (8)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-amber-500 shadow-sm flex flex-col justify-center space-y-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            $2,537.69
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            30-60 days (12)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-[#D31010] shadow-sm flex flex-col justify-center space-y-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            $10,941.26
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            60-90 days (22)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-[#990000] shadow-sm flex flex-col justify-center space-y-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            $87,025.93
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            over 90 days (178)
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-end gap-3">
          <div className="relative">
            <select className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => toast.success("Exporting Aging Invoices Report...")}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 px-6">Invoice No.</th>
                <th className="py-3.5 px-6">Invoice Name</th>
                <th className="py-3.5 px-6">Client name</th>
                <th className="py-3.5 px-6">Total</th>
                <th className="py-3.5 px-6">Balance</th>
                <th className="py-3.5 px-6">Due on</th>
                <th className="py-3.5 px-6">Created</th>
                <th className="py-3.5 px-6">Days Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {agingInvoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">{inv.invoiceNo}</td>
                  <td className="py-4 px-6 text-slate-400">{inv.invoiceName || "-"}</td>

                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => handleOpenClient(inv)}
                      className="flex flex-col text-left group cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#D31010] transition-colors">
                        {inv.clientName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {inv.clientEmail}
                      </span>
                    </button>
                  </td>

                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{inv.total}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{inv.balance}</td>
                  <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{inv.dueOn}</td>
                  <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{inv.created}</td>
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{inv.daysLate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClientDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}
