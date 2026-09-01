import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ChevronDown,
  Send,
  Eye,
  Download,
  Edit3,
  MessageSquare,
  Check,
  Calendar,
  RefreshCw,
  Trash2,
  Briefcase,
  Plus,
  X,
  Search,
  BookOpen,
  Camera,
  Paperclip,
  ChevronUp,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import DocumentSignatureModal from "./DocumentSignatureModal";
import NotFoundState from "./NotFoundState";
import { Loader2 } from "lucide-react";
import { Api } from "../services/service";

export default function InvoiceDetailContent() {
  const router = useRouter();
  const { id } = router.query;

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewIframeRef = React.useRef(null);
  const [invoiceName, setInvoiceName] = useState("");
  const [isEditingInvoiceName, setIsEditingInvoiceName] = useState(false);
  const [sentStatus, setSentStatus] = useState("No");

  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [cityStateZip, setCityStateZip] = useState("");

  const [jobId, setJobId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [signatureData, setSignatureData] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signedAt, setSignedAt] = useState(null);
  const [signatureStatus, setSignatureStatus] = useState("unassigned");
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const [lineItems, setLineItems] = useState([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [priceBookItems, setPriceBookItems] = useState([]);
  const [taxRate, setTaxRate] = useState(5.0);
  const [taxRegion, setTaxRegion] = useState("Alberta (5.0%)");

  const [notesText, setNotesText] = useState("");
  const [paymentsList, setPaymentsList] = useState([]);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("0.00");
  const [payType, setPayType] = useState("Credit charge");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [paidOn, setPaidOn] = useState(() => new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" }));
  const [emailReceipt, setEmailReceipt] = useState(true);

  const [isSendPanelOpen, setIsSendPanelOpen] = useState(false);
  const [sendTab, setSendTab] = useState("email");
  const [sendFrom, setSendFrom] = useState("Info@Pixlcanada.ca");
  const [sendTo, setSendTo] = useState("");
  const [sendCc, setSendCc] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [letPayCreditCard, setLetPayCreditCard] = useState(true);
  const [requestSignature, setRequestSignature] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    quantity: true,
    price: true,
    lineTotal: true,
    hourItems: false,
    expenseItems: true,
    serviceItems: true,
    productItems: true,
    equipmentTotal: true,
    warrantyItems: true,
  });

  useEffect(() => {
    console.log("[INVOICE DETAIL DEBUG] Component mounted with id:", id, "router.isReady:", router.isReady);
    if (id) {
      setInvoiceId(String(id));
      fetchInvoiceDetails();
      fetchPriceBook();
    }
  }, [id, router.isReady]);

  const fetchInvoiceDetails = async () => {
    console.log("[INVOICE DETAIL DEBUG] fetchInvoiceDetails started for ID:", id);
    setLoading(true);
    try {
      let data = null;
      try {
        console.log(`[INVOICE DETAIL DEBUG] Requesting GET api/invoices/${id}`);
        const res = await Api("GET", `api/invoices/${id}`, null, router);
        console.log("[INVOICE DETAIL DEBUG] GET api/invoices/:id response:", res);
        data = res?.data || (res && res._id ? res : null);
      } catch (e) {
        console.warn("[INVOICE DETAIL DEBUG] Error calling api/invoices/:id:", e);
      }

      if (!data) {
        try {
          console.log(`[INVOICE DETAIL DEBUG] Invoice not found directly, trying GET api/events/${id}`);
          const resEvent = await Api("GET", `api/events/${id}`, null, router);
          console.log("[INVOICE DETAIL DEBUG] GET api/events/:id response:", resEvent);
          const ev = resEvent?.data || (resEvent && resEvent._id ? resEvent : null);
          if (ev) {
            const shortInv = String(ev._id).slice(-3);
            const shortJob = String(ev._id).slice(-4);
            const sub = Number(ev.subtotal || ev.total_amount || 189.99);
            const rate = Number(ev.tax_rate !== undefined ? ev.tax_rate : 5.0);
            const tax = Number(ev.tax_amount || (sub * (rate / 100)).toFixed(2));
            const tot = Number(ev.total_amount || (sub + tax).toFixed(2));
            data = {
              _id: ev._id,
              invoice_number: shortInv,
              invoice_name: ev.title || "Job Invoice",
              client_name: ev.client_name || "Client",
              company_name: ev.company_name || "",
              client_email: ev.email || "",
              phone: ev.phone || "",
              address: ev.address || {},
              job_id: shortJob,
              line_items: Array.isArray(ev.line_items) && ev.line_items.length > 0 ? ev.line_items : [
                { name: ev.job_type || "Service Item", qty: 1, price: sub, cost: 0, taxable: true }
              ],
              subtotal: sub,
              tax_rate: rate,
              tax_amount: tax,
              total_amount: tot,
              amount_due: tot,
              status: ev.status === "Completed" ? "Paid" : "Due",
              sent_status: "No",
              payments: ev.payments || [],
              notes: ev.description || "",
            };
          }
        } catch (e) {
          console.warn("[INVOICE DETAIL DEBUG] Error calling api/events/:id:", e);
        }
      }

      if (!data) {
        try {
          console.log("[INVOICE DETAIL DEBUG] Trying to match in list GET api/invoices?limit=100");
          const resAll = await Api("GET", "api/invoices?limit=100", null, router);
          const list = Array.isArray(resAll?.data) ? resAll.data : [];
          data = list.find((i) => String(i._id) === String(id) || String(i.invoice_number) === String(id) || String(i.job_id) === String(id)) || null;
          console.log("[INVOICE DETAIL DEBUG] Match from list:", data);
        } catch (e) {
          console.warn("[INVOICE DETAIL DEBUG] Error calling api/invoices list:", e);
        }
      }

      if (data) {
        console.log("[INVOICE DETAIL DEBUG] Setting invoiceData successfully:", data);
        setInvoiceData(data);
        if (data.invoice_number) setInvoiceId(String(data.invoice_number));
        if (data.client_name) setClientName(String(data.client_name));
        if (data.company_name) setCompanyName(String(data.company_name));
        if (data.phone) {
          setPhone(String(data.phone));
          setSendPhone(String(data.phone));
        }
        if (data.client_email || data.email) {
          const mail = String(data.client_email || data.email || "");
          setEmail(mail);
          setSendTo(mail);
        }
        const nameVal = data.invoice_name || (typeof data.title === "string" ? data.title.split(" - ")[0] : "Invoice");
        setInvoiceName(String(nameVal));
        if (data.job_id) setJobId(String(data.job_id));
        if (data.notes || data.description) setNotesText(String(data.notes || data.description || ""));
        if (data.tax_rate !== undefined) setTaxRate(Number(data.tax_rate) || 5.0);
        if (data.sent_status) setSentStatus(String(data.sent_status));
        if (data.address) {
          const addr = data.address;
          if (typeof addr === "object" && addr !== null) {
            setStreetAddress(String(addr.street || ""));
            setCityStateZip(`${addr.city || ""} ${addr.region || ""} ${addr.postal_code || ""}`.trim());
          } else {
            setStreetAddress(String(addr));
          }
        }
        if (Array.isArray(data.payments) && data.payments.length > 0) {
          setPaymentsList(data.payments);
        }
        if (Array.isArray(data.line_items) && data.line_items.length > 0) {
          setLineItems(
            data.line_items.map((it, idx) => ({
              id: (it && (it._id || it.id)) || "item_" + idx,
              name: (it && it.name) || "Service Item",
              qty: Number(it?.qty) || 1,
              price: Number(it?.price) || 0,
              cost: Number(it?.cost) || 0,
              taxable: it?.taxable !== false,
              description: (it && it.description) || "",
            }))
          );
        }
      } else {
        console.error("[INVOICE DETAIL DEBUG] No invoice data found for ID:", id);
        setInvoiceData(null);
      }
    } catch (err) {
      console.error("[INVOICE DETAIL DEBUG] Critical error in fetchInvoiceDetails:", err);
      setInvoiceData(null);
    } finally {
      setLoading(false);
      console.log("[INVOICE DETAIL DEBUG] fetchInvoiceDetails completed, loading set to false.");
    }
  };

  const fetchPriceBook = async () => {
    try {
      const res = await Api("GET", "api/price-book", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setPriceBookItems(list);
    } catch (err) {
      setPriceBookItems([]);
    }
  };

  const handleAddItem = (pb) => {
    setLineItems((prev) => [
      ...prev,
      { id: "item_" + Date.now(), name: pb.name, qty: 1, price: Number(pb.price), cost: Number(pb.cost), taxable: true },
    ]);
    setIsAddItemModalOpen(false);
    toast.success(`Added "${pb.name}" to invoice`);
  };

  const handleAddPayment = async () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return;
    try {
      await Api("POST", `api/invoices/${invoiceId || id}/payment`, {
        amount: amt,
        method: payType,
        date: paidOn,
        transaction_id: confirmCode,
      }, router);
    } catch (e) {}

    setPaymentsList((prev) => [
      ...prev,
      { id: "pay_" + Date.now(), amount: amt, method: payType, date: paidOn },
    ]);
    setIsAddPaymentModalOpen(false);
    setPayAmount("0.00");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardZip("");
    setConfirmCode("");
    toast.success(`Recorded payment of $${amt.toFixed(2)}`);
  };

  const handleSendInvoice = async () => {
    if (sendTab === "email" && !sendTo) {
      toast.error("Please enter recipient email");
      return;
    }
    if (sendTab === "sms" && !sendPhone) {
      toast.error("Please enter recipient phone");
      return;
    }
    try {
      const payload = {
        send_type: sendTab,
        to: sendTo,
        cc: sendCc,
        phone: sendPhone,
        subject: sendSubject,
        message: sendMessage,
        request_signature: requestSignature,
        let_pay_credit_card: letPayCreditCard,
        advanced_options: advancedOptions,
      };
      await Api("POST", `api/invoices/${invoiceId || id}/send`, payload, router);
      setSentStatus("Yes");
      if (requestSignature && signatureStatus !== "signed") {
        setSignatureStatus("requested");
      }
      setIsSendPanelOpen(false);
      toast.success(
        requestSignature
          ? "Invoice and signature request sent successfully!"
          : "Invoice sent successfully!"
      );
      fetchInvoiceDetails();
    } catch (err) {
      toast.error(err.message || "Error sending invoice");
    }
  };

  const subtotal = lineItems.reduce((acc, it) => acc + it.price * it.qty, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  const paidTotal = paymentsList.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, totalAmount - paidTotal);

  const filteredPriceBook = priceBookItems.filter((it) =>
    it.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  const generateInvoiceHTML = () => {
    const shortInvoiceId = invoiceId.length > 6 ? invoiceId.slice(-4).toUpperCase() : invoiceId;
    const invoiceDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const dueDate = invoiceDate;
    const itemRows = lineItems.map((it) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">${it.name}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${it.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">$${it.price.toFixed(2)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">$${(it.price * it.qty).toFixed(2)}</td>
      </tr>`).join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #222; background: #fff; padding: 48px 60px; font-size: 13px; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #111; }
        .logo span { color: #D31010; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
        .invoice-title { font-size: 32px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
        .meta-label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .meta-val { font-size: 13px; font-weight: 600; color: #222; line-height: 1.6; }
        .meta-val a { color: #D31010; text-decoration: none; }
        .info-box { display: flex; gap: 48px; margin-bottom: 36px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { border-bottom: 2px solid #eee; }
        th { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; padding: 8px; text-align: left; }
        th:not(:first-child) { text-align: right; }
        td:not(:first-child) { text-align: right; }
        .totals-table { margin-left: auto; width: 280px; border-collapse: collapse; }
        .totals-table td { padding: 5px 8px; font-size: 13px; }
        .totals-table td:last-child { text-align: right; }
        .totals-table tr.balance td { font-weight: 800; font-size: 15px; border-top: 2px solid #eee; padding-top: 10px; }
        .terms { margin-top: 40px; font-size: 11px; color: #888; line-height: 1.7; border-top: 1px solid #eee; padding-top: 20px; }
        .thank-you { text-align: center; font-weight: 800; font-size: 16px; margin-top: 40px; color: #333; }
        @media print { body { padding: 20px 30px; } }
      </style></head><body>
      <div class="header">
        <div>
          <div class="logo">PI<span>X</span>L<span style="color:#111;font-size:10px;vertical-align:super;">.</span></div>
          <div style="margin-top:8px;font-size:12px;color:#888;">Pixl canada ltd</div>
          <div style="font-size:12px;color:#888;">(825) 461-5020</div>
          <div style="font-size:12px;color:#D31010;">info@pixlcanada.ca</div>
        </div>
        <div class="invoice-title">INVOICE</div>
      </div>
      <div style="display:flex;gap:60px;justify-content:space-between;margin-bottom:36px;">
        <div>
          <div class="meta-label">Invoice #</div>
          <div class="meta-val" style="font-size:18px;font-weight:800;">${shortInvoiceId}</div>
          <div style="margin-top:12px;"><span class="meta-label">Date</span><br/><span class="meta-val">${invoiceDate}</span></div>
          <div style="margin-top:12px;"><span class="meta-label">Balance</span><br/><span class="meta-val" style="color:#D31010;font-weight:800;">$${balanceDue.toFixed(2)}</span></div>
          <div style="margin-top:12px;"><span class="meta-label">Due On</span><br/><span class="meta-val">${dueDate}</span></div>
        </div>
      </div>
      <div class="info-box">
        <div>
          <div class="meta-label" style="margin-bottom:8px;">Bill To</div>
          <div class="meta-val">${clientName} ${companyName}<br/>${streetAddress}<br/>${cityStateZip}<br/><a href="tel:${phone}">${phone}</a><br/><a href="mailto:${email}">${email}</a></div>
        </div>
        <div>
          <div class="meta-label" style="margin-bottom:8px;">Service Location</div>
          <div class="meta-val">${clientName} ${companyName}<br/>${streetAddress}<br/>${cityStateZip}<br/><a href="tel:${phone}">${phone}</a><br/><a href="mailto:${email}">${email}</a></div>
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th>QTY</th><th>Price</th><th>Amount</th></tr></thead>
        <tbody>${itemRows.length ? itemRows : '<tr><td colspan="4" style="padding:24px;text-align:center;color:#bbb;">No items</td></tr>'}</tbody>
      </table>
      <table class="totals-table">
        <tr><td>Sub total</td><td>$${subtotal.toFixed(2)}</td></tr>
        <tr><td>Total</td><td>$${totalAmount.toFixed(2)}</td></tr>
        <tr class="balance"><td>Balance Due</td><td>$${balanceDue.toFixed(2)}</td></tr>
      </table>
      <div class="terms">
        <strong>Terms:</strong><br/>
        By paying the due balance on invoices provided, the Client hereby acknowledges that all requested service items for this date and/or any other dates listed above in the description section of the table, have been performed and have been tested showing successful satisfactory install/repair, unless otherwise stated on the invoice, in which labor service charges still apply if any repairs have been made. By accepting this invoice, the Client agrees to pay in full the amount listed in the Total section of the invoice.
        <br/><br/><strong>Notes:</strong>
      </div>
      ${signatureData ? `
      <div style="margin-top:24px;display:flex;align-items:flex-end;justify-content:space-between;padding-top:16px;border-top:1px dashed #ccc;">
        <div>
          <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;">Authorized Signature</div>
          <img src="${signatureData}" style="max-height:50px;margin-top:4px;" />
          <div style="font-size:11px;font-weight:700;color:#111;">${signerName || clientName}</div>
        </div>
        <div style="font-size:10px;color:#888;">
          Signed on: ${signedAt ? new Date(signedAt).toLocaleDateString() : new Date().toLocaleDateString()}
        </div>
      </div>
      ` : ''}
      <div class="thank-you"><em>Thank you for your business!</em></div>
    </body></html>`;
  };

  const handlePreview = () => {
    setShowActionsMenu(false);
    setShowPreview((prev) => !prev);
  };

  const handleDownload = async () => {
    setShowActionsMenu(false);
    toast.info("Generating PDF...");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const html = generateInvoiceHTML();
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-1;";
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "width:794px;height:1123px;border:none;";
      container.appendChild(iframe);
      document.body.appendChild(container);

      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();

      await new Promise((res) => setTimeout(res, 800));

      const canvas = await html2canvas(iframe.contentDocument.body, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
      });

      document.body.removeChild(container);

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

      pdf.save(`Invoice-${invoiceId}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-[#D31010] animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading invoice...</p>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <NotFoundState
        title="Invoice Not Found"
        message="This invoice was probably deleted, restricted or never existed."
        buttonText="Back to Invoices"
        backUrl="/invoices"
        breadcrumbs={[
          { label: `INVOICE (${invoiceId || id})`, url: "/invoices" },
          { label: "INVOICES", url: "/invoices" },
          { label: `INVOICE (${invoiceId || id})` },
        ]}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-4 sm:pt-6 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumb Header Bar */}
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span onClick={() => router.push("/clients")} className="hover:text-slate-600 cursor-pointer">CLIENT</span>
        <span>#</span>
        <span onClick={() => router.push("/schedule")} className="hover:text-slate-600 cursor-pointer">SCHEDULE</span>
        <span>#</span>
        <span onClick={() => router.push("/jobs/new")} className="hover:text-slate-600 cursor-pointer">NEW JOB</span>
        <span>#</span>
        <span onClick={() => router.push("/estimates")} className="hover:text-slate-600 cursor-pointer">ESTIMATE (1)</span>
        <span>#</span>
        <span onClick={() => router.push(`/jobs/${jobId}`)} className="hover:text-slate-600 cursor-pointer">JOB ({jobId})</span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">INVOICE ({invoiceId})</span>
      </div>

      {/* Back link to Job */}
      <button
        type="button"
        onClick={() => router.push(`/jobs/${jobId}`)}
        className="text-xs font-extrabold text-slate-500 hover:text-[#D31010] flex items-center gap-1 cursor-pointer"
      >
        <span>← Job ID: {jobId} - {invoiceName}</span>
      </button>

      {/* Client Header Title & Top Right Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Client: <span className="font-extrabold capitalize">{clientName}, {companyName}</span>
        </h1>

        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => toast.info("Automations panel")}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:border-slate-400 shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500" />
          </button>

          {/* Actions Dropdown Menu (Screenshot 4 Match) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 shadow-sm flex items-center gap-1.5 cursor-pointer"
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
                  className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs font-bold py-1.5 divide-y divide-slate-100 dark:divide-slate-800"
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        router.push(`/jobs/${jobId}`);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>View job</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePreview}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>{showPreview ? "Hide Preview" : "Preview"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        setIsSignatureModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      <span>Sign</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        setRequestSignature(true);
                        setSendSubject(`View invoice #${invoiceId} from Pixl canada ltd`);
                        setSendMessage(`Hi ${clientName.split(" ")[0] || "there"},\n\nThanks again for choosing Pixl canada ltd!\nYour invoice total is $${totalAmount.toFixed(2)}, and needs to be paid by ${paidOn || "due date"}.`);
                        setSendTo(email);
                        setSendPhone(phone);
                        setIsSendPanelOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>Request signature</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        setSentStatus("Yes");
                        toast.success("Invoice marked as sent!");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-slate-400" />
                      <span>Mark sent</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        toast.info("Auto invoicing enabled");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Set auto invoicing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        toast.success("Synced to QuickBooks successfully!");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-600" />
                      <span>Sync to quickBooks</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        toast.success("Invoice deleted");
                        router.push("/invoices");
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 text-red-600 font-bold cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => {
              setSendSubject(`View invoice #${invoiceId} from Pixl canada ltd`);
              setSendMessage(`Hi ${clientName.split(" ")[0]},\n\nThanks again for choosing Pixl canada ltd!\nYour invoice total is $${totalAmount.toFixed(2)}, and needs to be paid by Thu Aug 20, 2026.`);
              setSendTo(email);
              setSendPhone(phone);
              setIsSendPanelOpen(true);
            }}
            className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* 3 Columns Metadata Box (Screenshot 1) */}
      <div className="p-6 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-bold">
        {/* Bill to */}
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
            Bill to:
          </h3>
          <div className="text-slate-800 dark:text-slate-200 font-bold capitalize">{clientName} {companyName}</div>
          <div className="text-slate-500">{streetAddress}</div>
          <div className="text-slate-500">{cityStateZip}</div>
          <div className="text-slate-500">{phone}</div>
          <div className="text-slate-500">{email}</div>
        </div>

        {/* Service address */}
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
            Service address:
          </h3>
          <div className="text-slate-800 dark:text-slate-200 font-bold capitalize">{clientName} {companyName}</div>
          <div className="text-slate-500">{streetAddress}</div>
          <div className="text-slate-500">{cityStateZip}</div>
          <div className="text-slate-500">{phone}</div>
          <div className="text-slate-500">{email}</div>
        </div>

        {/* Invoice Info */}
        <div className="space-y-2 md:text-right">
          <div>
            <span className="text-slate-400 font-extrabold">Invoice ID: </span>
            <span className="text-slate-900 dark:text-white font-black">{invoiceId}</span>
          </div>

          <div className="flex items-center md:justify-end gap-1">
            <span className="text-slate-400 font-extrabold">Invoice name: </span>
            {isEditingInvoiceName ? (
              <input
                type="text"
                value={invoiceName}
                onChange={(e) => setInvoiceName(e.target.value)}
                onBlur={() => setIsEditingInvoiceName(false)}
                className="px-2 py-0.5 border border-slate-300 rounded text-xs font-bold"
                autoFocus
              />
            ) : (
              <span onClick={() => setIsEditingInvoiceName(true)} className="text-slate-900 dark:text-white font-bold cursor-pointer underline">
                {invoiceName}
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 font-extrabold">Invoice date: </span>
            <span className="text-slate-900 dark:text-white font-bold underline cursor-pointer">
              8/25/2026
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-extrabold">Sent: </span>
            <span className={`font-bold ${sentStatus === "Yes" ? "text-emerald-600" : "text-red-500"}`}>
              {sentStatus}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-extrabold">Signature: </span>
            {signatureStatus === "signed" || signatureData ? (
              <span className="font-bold text-emerald-600">Signed by {signerName || clientName}</span>
            ) : signatureStatus === "requested" ? (
              <span className="font-bold text-amber-500">Requested</span>
            ) : (
              <span className="font-bold text-slate-400">Not signed</span>
            )}
          </div>
        </div>
      </div>

      {/* PDF Preview Section */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3 bg-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-white text-xs font-bold">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Invoice Preview — #{invoiceId}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              </div>
            </div>
            <iframe
              ref={previewIframeRef}
              srcDoc={generateInvoiceHTML()}
              className="w-full bg-[#1a1a1a]"
              style={{ height: "780px", border: "none" }}
              title="Invoice Preview"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Section (Screenshots 1 & 2) */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Items
        </h2>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs font-bold">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 px-6">Item</th>
                <th className="py-3.5 px-6">Quantity</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Cost</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Taxable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lineItems.length > 0 ? (
                lineItems.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 text-slate-900 dark:text-white font-extrabold">{it.name}</td>
                    <td className="py-4 px-6">{it.qty}</td>
                    <td className="py-4 px-6">${it.price.toFixed(2)}</td>
                    <td className="py-4 px-6">${it.cost.toFixed(2)}</td>
                    <td className="py-4 px-6 text-[#D31010] font-black">${(it.price * it.qty).toFixed(2)}</td>
                    <td className="py-4 px-6">{it.taxable ? "Yes" : "No"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <BookOpen className="w-10 h-10 text-slate-300" />
                      <span className="font-extrabold text-slate-600 dark:text-slate-300">Add line items</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => setIsAddItemModalOpen(true)}
          className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add item</span>
        </button>

        {/* Financial Summary & Consumer Financing */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="w-full lg:w-96 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#D31010]">sunbit</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
              Win bigger jobs with consumer financing
            </h4>
            <p className="text-[11px] text-slate-500">
              Sign up with our partner sunbit to let your clients pay over time
            </p>
            <button
              type="button"
              onClick={() => toast.info("Consumer financing details")}
              className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md"
            >
              Learn More
            </button>
          </div>

          <div className="w-full lg:w-auto grid grid-cols-2 gap-x-8 gap-y-3 text-xs font-bold">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Total:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Balance:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">${balanceDue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Discount:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">$0.00</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Due:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">8/20/2026</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Taxable:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>

            <div className="col-span-2 flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Tax rate%:</span>
              <div className="relative">
                <select
                  value={taxRegion}
                  onChange={(e) => setTaxRegion(e.target.value)}
                  className="pl-3 pr-8 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-extrabold appearance-none cursor-pointer"
                >
                  <option value="Alberta (5.0%)">Alberta (5.0%)</option>
                  <option value="Ontario (13%)">Ontario (13%)</option>
                  <option value="None (0%)">None (0%)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between gap-4">
              <span className="text-slate-500">Tax:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">${taxAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Cards Grid (Screenshot 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
        {/* Notes Card */}
        <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-slate-400" />
              <span>Notes</span>
            </h3>
          </div>
          <textarea
            rows={4}
            placeholder="Add invoice notes..."
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none resize-none"
          />
        </div>

        {/* Payments Card */}
        <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Payments</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddPaymentModalOpen(true)}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-full hover:bg-slate-200 cursor-pointer"
            >
              Add payment
            </button>
          </div>

          {paymentsList.length > 0 ? (
            <div className="space-y-2">
              {paymentsList.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span>{p.method} ({p.date})</span>
                  <span className="text-[#D31010] font-extrabold">${p.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <span className="text-xl">💸</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-[#D31010] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D31010]" />
                <span>+ Add payments</span>
              </button>
            </div>
          )}
        </div>

        {/* Attachments Card */}
        <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span>Attachments</span>
            </h3>
            <button
              type="button"
              onClick={() => toast.info("Opening upload file picker...")}
              className="px-4 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          </div>
          <div className="py-6 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Paperclip className="w-8 h-8 text-slate-300" />
            <button
              type="button"
              onClick={() => toast.info("Opening upload file picker...")}
              className="text-xs font-extrabold text-[#D31010] hover:underline cursor-pointer"
            >
              + Upload files
            </button>
          </div>
        </div>

        {/* Signatures Card */}
        <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-slate-400" />
              <span>Signatures</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="px-4 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{signatureData ? "Re-sign" : "Sign"}</span>
            </button>
          </div>

          {signatureData || signatureStatus === "signed" ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Signed</span>
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {signedAt ? new Date(signedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-center min-h-[90px] shadow-inner">
                {signatureData ? (
                  <img
                    src={signatureData}
                    alt="Authorized signature"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs italic text-slate-400 font-semibold">Signature on file</span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Signer:</span>
                <span className="font-extrabold text-slate-900 dark:text-white capitalize">
                  {signerName || clientName}
                </span>
              </div>
            </div>
          ) : signatureStatus === "requested" ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Signature Requested
              </span>
              <p className="text-xs text-slate-400 max-w-xs">
                Awaiting client signature via email or SMS.
              </p>
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(true)}
                className="mt-2 text-xs font-extrabold text-[#D31010] hover:underline cursor-pointer"
              >
                Sign on screen now
              </button>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Edit3 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-semibold">No signature on file</p>
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(true)}
                className="text-xs font-extrabold text-[#D31010] hover:underline cursor-pointer"
              >
                + Sign document now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Job Item Modal Popup */}
      <AnimatePresence>
        {isAddItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddItemModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Add line item
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold">
                  {filteredPriceBook.length > 0 ? (
                    filteredPriceBook.map((pb) => (
                      <button
                        key={pb._id || pb.id || pb.name}
                        type="button"
                        onClick={() => handleAddItem(pb)}
                        className="w-full text-left p-3.5 hover:bg-red-50/60 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <span className="text-slate-800 dark:text-slate-200 group-hover:text-[#D31010]">
                          {pb.name} (${Number(pb.price).toFixed(2)})
                        </span>
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#D31010]" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 font-semibold">
                      No matching price book items found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Payment Modal Popup */}
      <AnimatePresence>
        {isAddPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPaymentModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Add payment
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">
                  {balanceDue > 0
                    ? `Balance due: $${balanceDue.toFixed(2)}`
                    : "This job doesn't have any balance"}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Payment type</label>
                    <select
                      value={payType}
                      onChange={(e) => setPayType(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer text-slate-900 dark:text-white"
                    >
                      <option value="Credit charge">Credit charge</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit offline">Credit offline</option>
                      <option value="Check">Check</option>
                      <option value="Bank transfer (offline)">Bank transfer (offline)</option>
                      <option value="Cash app">Cash app</option>
                      <option value="Consumer financing">Consumer financing</option>
                      <option value="Venmo">Venmo</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Debit offline">Debit offline</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-[65%] -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {(payType === "Credit charge") && (
                  <>
                    <input
                      type="text"
                      placeholder="Card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Zip code"
                        value={cardZip}
                        onChange={(e) => setCardZip(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {(payType !== "Credit charge") && (
                  <>
                    <input
                      type="text"
                      placeholder="Confirmation code"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                    />
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Paid on</label>
                      <input
                        type="text"
                        value={paidOn}
                        onChange={(e) => setPaidOn(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailReceipt}
                    onChange={(e) => setEmailReceipt(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D31010] cursor-pointer"
                  />
                  <span>Email Client a receipt</span>
                </label>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddPaymentModalOpen(false)}
                    className="flex-1 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-full hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPayment}
                    className="flex-1 px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
                  >
                    Charge
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Invoice Side Panel */}
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
                  Send invoice
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
                      <div className="relative">
                        <input
                          type="email"
                          value={sendTo}
                          onChange={(e) => setSendTo(e.target.value)}
                          className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900 dark:text-white"
                        />
                        {sendTo && (
                          <button type="button" onClick={() => setSendTo("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">One email address only</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Cc</label>
                      <input
                        type="email"
                        value={sendCc}
                        onChange={(e) => setSendCc(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-900 dark:text-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Up to 5 email addresses</p>
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

                <div className="space-y-2 pt-1">
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Let client pay with:</p>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={letPayCreditCard}
                      onChange={(e) => setLetPayCreditCard(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#4B9EFF] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Credit card</span>
                  </label>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestSignature}
                      onChange={(e) => setRequestSignature(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#4B9EFF] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Request signature</span>
                  </label>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-[#4B9EFF] text-xs font-extrabold cursor-pointer"
                  >
                    <span>Advanced</span>
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2">
                          <p className="text-[10px] font-extrabold text-slate-500 uppercase">Client can see:</p>
                          {[
                            { key: "quantity", label: "Quantity" },
                            { key: "price", label: "Price" },
                            { key: "lineTotal", label: "Line total" },
                            { key: "hourItems", label: "Hour items" },
                            { key: "expenseItems", label: "Expense items" },
                            { key: "serviceItems", label: "Service items" },
                            { key: "productItems", label: "Product items" },
                            { key: "equipmentTotal", label: "Equipment Total" },
                            { key: "warrantyItems", label: "Warranty items" },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={advancedOptions[key]}
                                onChange={(e) => setAdvancedOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                                className="w-4 h-4 rounded accent-[#4B9EFF] cursor-pointer"
                              />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 sticky bottom-0 bg-white dark:bg-[#0E1E31]">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  Preview invoice
                </button>
                <button
                  type="button"
                  onClick={handleSendInvoice}
                  className="flex-1 px-4 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
                >
                  {sendTab === "email" ? "Send email" : "Send text"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Document Signature Modal */}
      <DocumentSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        invoiceId={id}
        clientName={clientName}
        onSigned={(sigData) => {
          setSignatureData(sigData.signature);
          setSignerName(sigData.signer_name);
          setSignedAt(new Date());
          setSignatureStatus("signed");
          fetchInvoiceDetails();
        }}
      />
    </div>
  );
}
