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
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #fff; color: #1a1a2e; padding: 40px; }
  .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 32px; text-align: center; }
  .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .header p { font-size: 12px; opacity: 0.8; }
  .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; }
  .badge.completed, .badge.paid { background: #d1fae5; color: #065f46; }
  .badge.pending { background: #fef3c7; color: #92400e; }
  .badge.failed { background: #fee2e2; color: #991b1b; }
  .badge.refunded { background: #dbeafe; color: #1e40af; }
  .body { padding: 32px; }
  .amount-section { text-align: center; padding: 24px 0; border-bottom: 1px dashed #e2e8f0; margin-bottom: 24px; }
  .amount { font-size: 36px; font-weight: 800; color: #1a1a2e; }
  .currency { font-size: 14px; color: #64748b; margin-top: 4px; }
  .details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .detail-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
  .detail-item span { font-size: 14px; font-weight: 500; color: #1e293b; }
  .footer { border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; background: #f8fafc; }
  .footer p { font-size: 11px; color: #94a3b8; }
  @media print { body { padding: 0; } .receipt { border: none; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <h1>Atlast Wave Travel and Tours</h1>
    <p>Payment Receipt</p>
    <span class="badge ${data.status}">${data.status}</span>
  </div>
  <div class="body">
    <div class="amount-section">
      <div class="amount">${formatCurrency(data.amount, currency)}</div>
      <div class="currency">${currency}</div>
    </div>
    <div class="details">
      <div class="detail-item"><label>Reference</label><span>${data.reference}</span></div>
      <div class="detail-item"><label>Date</label><span>${data.date}</span></div>
      <div class="detail-item"><label>Description</label><span>${data.description}</span></div>
      <div class="detail-item"><label>Payment Method</label><span>${data.paymentMethod}</span></div>
      <div class="detail-item"><label>Customer</label><span>${data.customerName}</span></div>
      <div class="detail-item"><label>Email</label><span>${data.customerEmail}</span></div>
    </div>
  </div>
  <div class="footer">
    <p>Thank you for your payment. This receipt was generated on ${new Date().toLocaleDateString()}.</p>
    <p style="margin-top:4px">Atlast Wave Travel and Tours | support@atlaswave.com</p>
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
