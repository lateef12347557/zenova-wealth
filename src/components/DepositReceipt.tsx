import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, X } from "lucide-react";

interface ReceiptData {
  transactionId: string;
  amount: number;
  displayedAmount: number;
  date: string;
  email: string;
  name: string;
}

interface DepositReceiptProps {
  open: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

const DepositReceipt = ({ open, onClose, data }: DepositReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const handleDownload = () => {
    if (!receiptRef.current) return;
    const content = receiptRef.current;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Zenova Receipt - ${data.transactionId}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px; }
        .receipt { max-width: 480px; margin: 0 auto; background: #141414; border: 1px solid #2a2a2a; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 700; color: #eab308; letter-spacing: 2px; }
        .check { color: #22c55e; font-size: 48px; margin: 12px 0; }
        .title { font-size: 18px; font-weight: 600; }
        .subtitle { color: #888; font-size: 13px; margin-top: 4px; }
        .divider { border: none; border-top: 1px solid #2a2a2a; margin: 16px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .row .label { color: #888; }
        .row .value { font-weight: 500; }
        .total { font-size: 18px; font-weight: 700; color: #eab308; }
        .footer { text-align: center; color: #555; font-size: 12px; margin-top: 24px; }
        @media print { body { background: white; color: black; } .receipt { border-color: #ddd; background: white; } .row .label { color: #666; } .footer { color: #999; } .logo { color: #b8860b; } .total { color: #b8860b; } }
      </style></head><body>
      <div class="receipt">
        <div class="header">
          <div class="logo">ZENOVA</div>
          <div class="check">✓</div>
          <div class="title">Payment Successful</div>
          <div class="subtitle">Your deposit has been processed</div>
        </div>
        <hr class="divider" />
        <div class="row"><span class="label">Transaction ID</span><span class="value">${data.transactionId}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${new Date(data.date).toLocaleString()}</span></div>
        <div class="row"><span class="label">Name</span><span class="value">${data.name}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${data.email}</span></div>
        <hr class="divider" />
        <div class="row"><span class="label">Deposit Amount</span><span class="value">$${data.amount.toFixed(2)}</span></div>
        <div class="row"><span class="label">Growth (4x)</span><span class="value" style="color:#22c55e">+$${(data.displayedAmount - data.amount).toFixed(2)}</span></div>
        <hr class="divider" />
        <div class="row"><span class="label">Total Added to Balance</span><span class="total">$${data.displayedAmount.toFixed(2)}</span></div>
        <div class="footer">
          <p>This receipt serves as proof of payment.</p>
          <p>Zenova Investment Platform</p>
        </div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="sr-only">Deposit Receipt</DialogTitle>
        </DialogHeader>
        <div ref={receiptRef} className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-widest text-primary">ZENOVA</h2>
            <CheckCircle className="mx-auto text-green-500" size={48} />
            <p className="text-lg font-semibold text-foreground">Payment Successful</p>
            <p className="text-xs text-muted-foreground">Your deposit has been processed</p>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-2 text-sm">
            <Row label="Transaction ID" value={data.transactionId} />
            <Row label="Date" value={new Date(data.date).toLocaleString()} />
            <Row label="Name" value={data.name} />
            <Row label="Email" value={data.email} />
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <Row label="Deposit Amount" value={`$${data.amount.toFixed(2)}`} />
            <Row label="Growth (4x)" value={`+$${(data.displayedAmount - data.amount).toFixed(2)}`} valueClass="text-green-500" />
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Added</span>
            <span className="text-xl font-bold text-primary">${data.displayedAmount.toFixed(2)}</span>
          </div>

          <p className="text-center text-xs text-muted-foreground">This receipt serves as proof of payment.</p>
        </div>

        <div className="flex gap-2 mt-2">
          <Button onClick={handleDownload} className="flex-1" variant="outline">
            <Download className="mr-2" size={16} /> Download / Print
          </Button>
          <Button onClick={onClose} className="flex-1">
            <X className="mr-2" size={16} /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-medium text-foreground ${valueClass}`}>{value}</span>
  </div>
);

export default DepositReceipt;
