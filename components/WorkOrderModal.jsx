import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Download, Calendar, User, MapPin, Phone, Mail, Wrench } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function WorkOrderModal({
  isOpen,
  onClose,
  jobData,
  clientName,
  companyName,
  phone,
  email,
  fullAddress,
  startDate,
  startTime,
  endDate,
  endTime,
  assignedTechs = [],
  lineItems = [],
  description,
  jobType,
  totalAmount,
}) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const jobId = jobData?._id ? String(jobData._id).substring(String(jobData._id).length - 4) : "1001";

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    toast.info("Generating Work Order PDF...");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const element = printRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;

      let yPos = 0;
      let remaining = imgH;
      while (remaining > 0) {
        if (yPos > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -yPos, pageW, imgH);
        yPos += pageH;
        remaining -= pageH;
      }

      pdf.save(`WorkOrder-Job-${jobId}.pdf`);
      toast.success("Work Order PDF downloaded!");
    } catch (err) {
      toast.error("Failed to generate Work Order PDF");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D31010]" />
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Work Order — Job #{jobId}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Work Order Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6" ref={printRef}>
            {/* Header branding */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  PI<span className="text-[#D31010]">X</span>L<span className="text-[#D31010]">.</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Pixl Canada Ltd • Field Service Operations</p>
                <p className="text-xs text-slate-400 font-medium">info@pixlcanada.ca • (825) 461-5020</p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="px-3 py-1 bg-red-50 text-[#D31010] dark:bg-red-950/60 dark:text-red-300 rounded-full text-xs font-black uppercase tracking-wider">
                  WORK ORDER #{jobId}
                </span>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  Issued: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              </div>
            </div>

            {/* 2-Column Info: Client & Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Client & Location
                </h4>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                  {clientName} {companyName && `(${companyName})`}
                </div>
                {fullAddress && (
                  <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{fullAddress}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Service Schedule & Assignment
                </h4>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {startDate || "Date TBD"} {startTime ? `@ ${startTime}` : ""} {endTime ? `- ${endTime}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Technician:{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {assignedTechs.length > 0 ? assignedTechs.map((t) => t.name || t).join(", ") : "Unassigned"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Job Type: <strong className="text-slate-900 dark:text-white">{jobType || "Service Call"}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Scope of Work / Description */}
            {description && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Job Description / Instructions
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {description}
                </div>
              </div>
            )}

            {/* Line Items / Services to perform */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Services & Equipment To Install / Perform
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Item / Service</th>
                      <th className="p-3 text-center">Type</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {lineItems.length > 0 ? (
                      lineItems.map((it, idx) => (
                        <tr key={it.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{it.name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {it.item_type || "SERVICE"}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">{it.qty}</td>
                          <td className="p-3 text-right text-slate-600 dark:text-slate-300">${Number(it.price).toFixed(2)}</td>
                          <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                            ${(Number(it.price) * Number(it.qty)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 font-medium italic">
                          No line items assigned to this work order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {lineItems.length > 0 && (
                    <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 font-black text-xs">
                      <tr>
                        <td colSpan={4} className="p-3 text-right text-slate-600 dark:text-slate-400">
                          Estimated Total:
                        </td>
                        <td className="p-3 text-right text-[#D31010] text-sm font-black">
                          ${Number(totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Field Signatures / Handover lines */}
            <div className="pt-8 border-t border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-semibold text-slate-500">
              <div className="space-y-6">
                <div className="h-10 border-b border-slate-400 dark:border-slate-600" />
                <div>Technician Signature & Date</div>
              </div>
              <div className="space-y-6">
                <div className="h-10 border-b border-slate-400 dark:border-slate-600" />
                <div>Client Authorization & Date</div>
              </div>
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
