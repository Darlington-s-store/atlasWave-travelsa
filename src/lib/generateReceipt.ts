import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

export interface ReceiptData {
  reference: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  customerName: string;
  customerEmail: string;
}

export function generateReceiptPDF(data: ReceiptData) {
  const currency = data.currency || DEFAULT_CURRENCY;
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt - ${data.reference}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 32px; }
  .receipt { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #0a3d62; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 44px; height: 44px; border-radius: 10px; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #0a3d62; font-size: 18px; }
  .brand-text h2 { color: #fff; font-size: 17px; font-weight: 700; margin-bottom: 2px; }
  .brand-text p { color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.5px; }
  .receipt-label { color: rgba(255,255,255,0.85); font-size: 12px; font-weight: 600; text-align: right; }
  .receipt-label span { display: block; color: #fff; font-size: 15px; font-weight: 700; margin-top: 2px; }
  .status-bar { padding: 12px 32px; text-align: center; }
  .status-bar.completed { background: #ecfdf5; }
  .status-bar.paid { background: #ecfdf5; }
  .status-bar.pending { background: #fffbeb; }
  .status-bar.failed { background: #fef2f2; }
  .status-bar.refunded { background: #eff6ff; }
  .status-tag { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
  .status-tag.completed, .status-tag.paid { background: #d1fae5; color: #065f46; }
  .status-tag.pending { background: #fef3c7; color: #92400e; }
  .status-tag.failed { background: #fee2e2; color: #991b1b; }
  .status-tag.refunded { background: #dbeafe; color: #1e40af; }
  .body { padding: 32px; }
  .amount-block { text-align: center; padding: 24px 0 28px; border-bottom: 1px solid #f1f5f9; }
  .amount-block .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 600; margin-bottom: 6px; }
  .amount-block .value { font-size: 40px; font-weight: 800; color: #0f172a; }
  .amount-block .currency-label { font-size: 13px; color: #64748b; margin-top: 4px; }
  .details { padding-top: 24px; }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f8fafc; }
  .detail-row:last-child { border-bottom: none; }
  .detail-row .key { font-size: 13px; color: #64748b; font-weight: 500; }
  .detail-row .val { font-size: 13px; color: #1e293b; font-weight: 600; text-align: right; }
  .footer { border-top: 1px solid #e2e8f0; padding: 20px 32px; background: #f8fafc; text-align: center; }
  .footer p { font-size: 11px; color: #94a3b8; line-height: 1.6; }
  .footer .brand-line { font-weight: 600; color: #64748b; margin-top: 4px; }
  @media print { body { padding: 0; background: #fff; } .receipt { box-shadow: none; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <div class="brand">
      <div class="brand-logo">AW</div>
      <div class="brand-text">
        <h2>AtlastWave Travel & Tour</h2>
        <p>Travel · Immigration · Logistics</p>
      </div>
    </div>
    <div class="receipt-label">
      Receipt
      <span>#${data.reference}</span>
    </div>
  </div>
  <div class="status-bar ${data.status}">
    <span class="status-tag ${data.status}">${data.status}</span>
  </div>
  <div class="body">
    <div class="amount-block">
      <div class="label">Amount Paid</div>
      <div class="value">${formatCurrency(data.amount, currency)}</div>
      <div class="currency-label">${currency}</div>
    </div>
    <div class="details">
      <div class="detail-row"><span class="key">Reference</span><span class="val">${data.reference}</span></div>
      <div class="detail-row"><span class="key">Date</span><span class="val">${data.date}</span></div>
      <div class="detail-row"><span class="key">Description</span><span class="val">${data.description}</span></div>
      <div class="detail-row"><span class="key">Payment Method</span><span class="val">${data.paymentMethod}</span></div>
      <div class="detail-row"><span class="key">Customer</span><span class="val">${data.customerName}</span></div>
      <div class="detail-row"><span class="key">Email</span><span class="val">${data.customerEmail}</span></div>
    </div>
  </div>
  <div class="footer">
    <p>Thank you for choosing AtlastWave Travel and Tour.</p>
    <p class="brand-line">AtlastWave Travel and Tour · Accra, Ghana · support@atlaswave.com · +233 XX XXX XXXX</p>
    <p>Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=700,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.print();
  };
}
