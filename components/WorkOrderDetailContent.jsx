import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Wrench,
  Printer,
  Download,
  Edit3,
  Send,
  X,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import NotFoundState from "./NotFoundState";

const formatWorkizDate = (dateObj) => {
  const d = dateObj ? new Date(dateObj) : new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getDate();
  const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 || Math.floor((day % 100) / 10) === 1 ? 0 : day % 10];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours.toString().padStart(2, "0");
  return `${month} ${day}${suffix} ${year} ${strHours}:${minutes}${ampm}`;
};

export default function WorkOrderDetailContent() {
  const router = useRouter();
  const { id } = router.query;

  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const canvasRef = useRef(null);

  const [isSendPanelOpen, setIsSendPanelOpen] = useState(false);
  const [sendTab, setSendTab] = useState("email");
  const [sendFrom, setSendFrom] = useState("Info@Pixlcanada.ca");
  const [sendTo, setSendTo] = useState("");
  const [sendCc, setSendCc] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendPhone, setSendPhone] = useState("");

  const [signatureData, setSignatureData] = useState("");
  const [signedAt, setSignedAt] = useState(null);
  const documentSheetRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await Api("GET", `api/events/${id}`, null, router);
      const data = res?.data || (res && res._id ? res : null);
      if (data && (data._id || data.client_name || data.title)) {
        setJobData(data);
        setSignerName(data.work_order_signer || data.client_name || "");
        if (data.work_order_signature) setSignatureData(data.work_order_signature);
        if (data.work_order_signed_at) setSignedAt(data.work_order_signed_at);
        if (data.email) setSendTo(data.email);
        if (data.phone) setSendPhone(data.phone);

        const shortId = data._id ? String(data._id).substring(String(data._id).length - 4) : id;
        setSendSubject(`Work Order #${shortId} from Pixl canada ltd`);
        setSendMessage(
          `Hi ${data.client_name ? data.client_name.split(" ")[0] : "there"},\n\nPlease find attached the Work Order for your scheduled service.\n\nThank you,\nPixl canada ltd`
        );
      } else {
        setJobData(null);
      }
    } catch (err) {
      console.error(err);
      setJobData(null);
    } finally {
      setLoading(false);
    }
  };

  const shortJobId = jobData?._id
    ? String(jobData._id).substring(String(jobData._id).length - 4)
    : id || "982";

  const clientName = jobData?.client_name || "Janice Diner";
  const companyName = jobData?.company_name || "";
  const phone = jobData?.phone || "(416) 460-9444";
  const email = jobData?.email || "janice@janicediner.com";

  let fullAddress = "260 Heath Street West, Toronto, Ontario M5P 3L6";
  if (jobData?.address) {
    const a = jobData.address;
    const formatted = `${a.street || ""} ${a.city || ""}, ${a.region || ""} ${a.postal_code || ""}`.trim();
    if (formatted) fullAddress = formatted;
  }

  const lineItems = Array.isArray(jobData?.line_items) && jobData.line_items.length > 0
    ? jobData.line_items
    : [
        { id: "1", name: "Tv Installation 61\"-75\"", qty: 1, price: 109.99, item_type: "SERVICE" },
        { id: "2", name: "Sound Bar Installation", qty: 1, price: 49.00, item_type: "SERVICE" },
        { id: "3", name: "Sound bar mount", qty: 1, price: 50.00, item_type: "PRODUCT" },
      ];

  const subtotal = lineItems.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 1), 0);
  const taxAmount = (subtotal * 5) / 100;
  const totalAmount = subtotal + taxAmount;
  const payments = Array.isArray(jobData?.payments) ? jobData.payments : [];
  const paidTotal = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const balanceDue = Math.max(0, totalAmount - paidTotal);

  const handlePrint = () => {
    setShowActionsMenu(false);
    window.print();
  };

  const handleDownload = async () => {
    setShowActionsMenu(false);
    toast.info("Generating Work Order PDF...");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const element = documentSheetRef.current;
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

      pdf.save(`WorkOrder-#${shortJobId}.pdf`);
      toast.success("Work Order PDF downloaded!");
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleAcceptSignature = async (e) => {
    e.preventDefault();
    if (!hasDrawn) {
      toast.error("Please provide a signature on the canvas");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const sigData = canvas.toDataURL("image/png");

    setIsSavingSignature(true);
    try {
      const targetId = jobData?._id || id;
      const now = new Date();
      await Api(
        "PUT",
        `api/events/${targetId}`,
        {
          work_order_signature: sigData,
          work_order_signer: signerName.trim() || clientName,
          work_order_signed_at: now,
        },
        router
      );

      setSignatureData(sigData);
      setSignedAt(now);
      setIsSignModalOpen(false);
      toast.success("Work order signature accepted!");
    } catch (err) {
      toast.error(err.message || "Failed to save signature");
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleSendWorkOrder = async () => {
    try {
      const targetId = jobData?._id || id;
      await Api(
        "PUT",
        `api/events/${targetId}`,
        {
          work_order_sent_status: "Yes",
          work_order_sent_at: new Date(),
        },
        router
      );
      setIsSendPanelOpen(false);
      toast.success(sendTab === "email" ? "Work order sent via email!" : "Work order sent via SMS!");
    } catch (err) {
      toast.error(err.message || "Failed to send work order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-[#D31010] animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading work order...</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <NotFoundState
        title="Job Not Found"
        message="This job was probably deleted, restricted or never existed."
        buttonText="Back to Jobs"
        backUrl="/jobs"
        breadcrumbs={[
          { label: `JOB (${shortJobId})`, url: "/jobs" },
          { label: "JOBS", url: "/jobs" },
          { label: "WORK ORDER", url: "/jobs" },
          { label: `JOB (${shortJobId})` },
        ]}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumbs */}
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span>DOCUMENT</span>
        <span>#</span>
        <span onClick={() => router.push("/jobs")} className="hover:text-slate-600 cursor-pointer">
          JOB ({shortJobId})
        </span>
        <span>#</span>
        <span onClick={() => router.push(`/invoices/${shortJobId}`)} className="hover:text-slate-600 cursor-pointer">
          INVOICE ({shortJobId})
        </span>
        <span>#</span>
        <span onClick={() => router.push("/jobs")} className="hover:text-slate-600 cursor-pointer">
          JOBS
        </span>
        <span>#</span>
        <span onClick={() => router.push(`/jobs/${id}`)} className="hover:text-slate-600 cursor-pointer">
          JOB ({shortJobId})
        </span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">WORK ORDER</span>
      </div>

      {/* Back to Job link */}
      <button
        type="button"
        onClick={() => router.push(`/jobs/${id}`)}
        className="text-xs font-bold text-slate-500 hover:text-[#D31010] flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span>← Job #{shortJobId}</span>
      </button>

      {/* Header Title & Top Right Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Work Order #{shortJobId}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Client: <span className="font-extrabold text-slate-900 dark:text-white capitalize">{clientName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {showActionsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs font-bold py-1 divide-y divide-slate-100 dark:divide-slate-800"
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        router.push(`/jobs/${id}`);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4 text-slate-400" />
                      <span>View Job</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-400" />
                      <span>Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        setIsSignModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      <span>Sign</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setIsSendPanelOpen(true)}
            className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Main Document Viewer Container (Workiz Document Viewer UI) */}
      <div className="border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl bg-slate-900 flex flex-col">
        {/* Dark Top Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#2B2D30] text-slate-200 text-xs font-semibold select-none border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-300 text-xs">Work Order #{shortJobId}.pdf</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-md text-xs font-bold text-slate-300">
              <span className="text-white">1</span>
              <span className="text-slate-500">/</span>
              <span>1</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-700" />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-1.5 text-slate-200">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-700" />

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Center: Left Sidebar + Continuous Sheet Canvas */}
        <div className="flex flex-1 min-h-[750px] bg-[#3B3E43]">
          {/* Left Thumbnails Column */}
          <div className="w-44 bg-[#2C2E33] border-r border-slate-700 p-4 space-y-4 hidden md:flex flex-col items-center select-none overflow-y-auto">
            {/* Page 1 Thumbnail */}
            <div
              className="w-32 bg-white rounded shadow-md ring-2 ring-[#D31010] p-2 flex flex-col justify-between"
              style={{ height: "180px" }}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[6px] font-black text-slate-900">PIXL.</span>
                  <span className="text-[5px] font-bold text-slate-500">WORK ORDER</span>
                </div>
                <div className="h-1 bg-slate-200 rounded w-16" />
                <div className="h-1 bg-slate-100 rounded w-20" />
                <div className="mt-2 h-12 bg-slate-50 border border-slate-200 rounded" />
                <div className="mt-1 h-3 bg-slate-100 rounded w-24" />
              </div>
              <div className="text-[9px] font-bold text-slate-600 text-center">1</div>
            </div>
          </div>

          {/* Center Document Canvas (Authentic A4 Work Order Sheet) */}
          <div className="flex-1 p-6 md:p-10 flex justify-center items-start overflow-y-auto">
            <div
              ref={documentSheetRef}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className="w-full max-w-[850px] bg-white text-slate-900 shadow-2xl p-8 sm:p-14 transition-transform duration-150 min-h-[1050px] flex flex-col justify-between font-sans rounded-xs space-y-8"
            >
              {/* Header: Logo, Company & Title */}
              <div className="flex items-start justify-between pb-6 border-b border-slate-200">
                <div>
                  <div className="text-3xl font-black tracking-tight text-slate-900">
                    PI<span className="text-[#D31010]">X</span>L<span className="text-[#D31010] text-sm align-super">.</span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-1">Pixl canada ltd</div>
                  <div className="text-xs text-slate-500">Edmonton Canada Edmonton AB T6L1T9</div>
                  <div className="text-xs text-slate-500">(825) 461-5020</div>
                  <div className="text-xs text-[#D31010] font-medium">info@pixlcanada.ca</div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-2xl font-black text-slate-800 tracking-wide uppercase">
                    WORK ORDER
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    Job # <span className="font-extrabold text-slate-900">{shortJobId}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Bill To & Service Location (2-Columns Exact Workiz Layout) */}
              <div className="grid grid-cols-2 gap-8 text-xs py-1">
                <div>
                  <div className="font-extrabold text-slate-800 uppercase text-[11px] mb-1">
                    Bill To:
                  </div>
                  <div className="font-extrabold text-slate-900 capitalize">{clientName}</div>
                  {companyName && <div className="text-slate-600 font-medium">{companyName}</div>}
                  <div className="text-slate-600">{fullAddress}</div>
                  <div className="text-slate-600">{phone}</div>
                  <div className="text-slate-600">{email}</div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-800 uppercase text-[11px] mb-1">
                    Service Location:
                  </div>
                  <div className="font-extrabold text-slate-900 capitalize">{clientName}</div>
                  {companyName && <div className="text-slate-600 font-medium">{companyName}</div>}
                  <div className="text-slate-600">{fullAddress}</div>
                  <div className="text-slate-600">{phone}</div>
                  <div className="text-slate-600">{email}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-700">
                      <th className="py-2.5">Item / Service Description</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Price</th>
                      <th className="py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-3 pr-2 font-bold text-slate-800">
                          {item.name}
                          {item.description && (
                            <div className="text-[11px] text-slate-500 font-normal mt-0.5">{item.description}</div>
                          )}
                        </td>
                        <td className="py-3 text-center font-bold text-slate-700">{item.qty || 1}</td>
                        <td className="py-3 text-right text-slate-700">${Number(item.price || 0).toFixed(2)}</td>
                        <td className="py-3 text-right font-black text-slate-900">
                          ${(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Right aligned Totals & Balance matching Workiz */}
                <div className="mt-4 pt-3 border-t-2 border-slate-800 flex justify-end">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Balance</span>
                      <span>${balanceDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Section (Exact Workiz Text from Screenshot) */}
              <div className="space-y-3 pt-4 border-t border-slate-200 text-xs">
                <div className="font-extrabold text-slate-800 text-[11px]">Terms:</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  By paying the due balance on invoices provided, the Client hereby acknowledges that all requested service items for this date and/or any other dates listed above in the description section of the table, have been performed and have been tested showing successful satisfactory install/repair, unless otherwise stated on the invoice, in which labor service charges still apply if any repairs have been made. By accepting this invoice, the Client agrees to pay in full the amount listed in the Total section of the invoice.
                </p>

                <div className="pt-2">
                  <span className="font-extrabold text-slate-800 text-[11px]">Notes: </span>
                  <span className="text-[11px] text-slate-600">{jobData?.description || ""}</span>
                </div>
              </div>

              {/* Thank you for your business! */}
              <div className="text-center font-extrabold italic text-slate-800 text-sm pt-4">
                Thank you for your business!
              </div>

              {/* 3-Columns Exact Signature Block from Screenshot */}
              <div className="pt-6 border-t border-slate-300">
                <div className="grid grid-cols-3 gap-6 text-xs items-start">
                  <div>
                    <div className="font-extrabold text-slate-900 text-[12px] mb-2">Signature</div>
                    {signatureData ? (
                      <img
                        src={signatureData}
                        alt="Signature"
                        className="max-h-16 max-w-full object-contain -ml-1 cursor-pointer"
                        onClick={() => setIsSignModalOpen(true)}
                        title="Click to re-sign"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsSignModalOpen(true)}
                        className="px-4 py-2 border-2 border-dashed border-slate-300 hover:border-[#D31010] rounded-xl text-xs font-bold text-slate-400 hover:text-[#D31010] cursor-pointer transition-colors"
                      >
                        + Click to sign
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="font-extrabold text-slate-900 text-[12px] mb-2">Signed By</div>
                    <div className="text-xs font-bold text-slate-800 pt-2">
                      {signatureData ? signerName || clientName : "—"}
                    </div>
                  </div>

                  <div>
                    <div className="font-extrabold text-slate-900 text-[12px] mb-2">Signed</div>
                    <div className="text-xs font-bold text-slate-800 pt-2">
                      {signatureData ? formatWorkizDate(signedAt) : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Signature Modal (Screenshot 3 Matching Workiz Signature Popup) */}
      <AnimatePresence>
        {isSignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSignModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Document Signature
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAcceptSignature} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Please sign in the box below:
                  </label>

                  <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white relative shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={420}
                      height={170}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-40 cursor-crosshair touch-none bg-white"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-semibold select-none">
                        Draw signature here
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Signer name (if different than customer):
                  </label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-xs font-bold transition-colors cursor-pointer min-w-[100px]"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSignature}
                    className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-[140px] disabled:opacity-50"
                  >
                    {isSavingSignature ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Accept Signature</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Work Order Side Drawer */}
      <AnimatePresence>
        {isSendPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSendPanelOpen(false)}
              className="fixed inset-0 z-40 bg-black"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-[#0E1E31] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col text-slate-800 dark:text-slate-100 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#0E1E31] z-10">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Send Work Order
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSendPanelOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-slate-200 dark:border-slate-800 px-6">
                {["email", "sms"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSendTab(tab)}
                    className={`pb-3 pt-4 text-xs font-extrabold capitalize mr-6 border-b-2 transition-all cursor-pointer ${
                      sendTab === tab
                        ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {tab === "email" ? "Via email" : "Via SMS"}
                  </button>
                ))}
              </div>

              <div className="flex-1 px-6 py-5 space-y-4 text-xs">
                {sendTab === "email" ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">From</label>
                      <input
                        type="text"
                        value={sendFrom}
                        onChange={(e) => setSendFrom(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">To</label>
                      <input
                        type="email"
                        value={sendTo}
                        onChange={(e) => setSendTo(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Message</label>
                      <input
                        type="text"
                        value={sendSubject}
                        onChange={(e) => setSendSubject(e.target.value)}
                        placeholder="Subject"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-t-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                      />
                      <textarea
                        rows={5}
                        value={sendMessage}
                        onChange={(e) => setSendMessage(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 border-t-0 rounded-b-xl text-xs font-semibold focus:outline-none resize-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Phone</label>
                      <input
                        type="text"
                        value={sendPhone}
                        onChange={(e) => setSendPhone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Message</label>
                      <textarea
                        rows={5}
                        value={sendMessage}
                        onChange={(e) => setSendMessage(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none resize-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 sticky bottom-0 bg-white dark:bg-[#0E1E31]">
                <button
                  type="button"
                  onClick={() => setIsSendPanelOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendWorkOrder}
                  className="flex-1 px-4 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
                >
                  {sendTab === "email" ? "Send email" : "Send text"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
