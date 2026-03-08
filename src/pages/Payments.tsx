import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Smartphone,
  ArrowLeftRight,
  Download,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Shield,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const MOCK_TRANSACTIONS = [
  { id: "TXN-2024-001", date: "2024-03-08", description: "Schengen Work Permit Application", amount: 450, currency: "USD", method: "Mastercard", status: "completed" as const },
  { id: "TXN-2024-002", date: "2024-03-06", description: "Flight Booking — Accra to London", amount: 1250, currency: "USD", method: "Mobile Money", status: "completed" as const },
  { id: "TXN-2024-003", date: "2024-03-05", description: "Consultation Booking", amount: 75, currency: "USD", method: "Mastercard", status: "completed" as const },
  { id: "TXN-2024-004", date: "2024-03-04", description: "Sea Cargo Shipment — GH to UK", amount: 800, currency: "USD", method: "Mobile Money", status: "pending" as const },
  { id: "TXN-2024-005", date: "2024-03-01", description: "Hotel Accommodation — Paris", amount: 320, currency: "USD", method: "Mastercard", status: "failed" as const },
  { id: "TXN-2024-006", date: "2024-02-28", description: "Visa Processing Fee", amount: 200, currency: "USD", method: "Mobile Money", status: "refunded" as const },
];

const EXCHANGE_RATE = 15.2; // 1 USD = 15.2 GHS (mock)

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Completed", className: "bg-secondary/10 text-secondary border-secondary/20" },
  pending: { icon: Clock, label: "Pending", className: "bg-accent/10 text-accent-foreground border-accent/20" },
  failed: { icon: XCircle, label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
  refunded: { icon: RefreshCw, label: "Refunded", className: "bg-muted text-muted-foreground border-border" },
};

const Payments = () => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo">("card");
  const [amount, setAmount] = useState("");
  const [convertFrom, setConvertFrom] = useState<"USD" | "GHS">("USD");
  const [convertAmount, setConvertAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const convertedValue = convertAmount
    ? convertFrom === "USD"
      ? (parseFloat(convertAmount) * EXCHANGE_RATE).toFixed(2)
      : (parseFloat(convertAmount) / EXCHANGE_RATE).toFixed(2)
    : "0.00";

  const filteredTransactions = MOCK_TRANSACTIONS.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid payment amount.", variant: "destructive" });
      return;
    }
    toast({ title: "Payment Initiated", description: `Processing $${amount} via ${paymentMethod === "card" ? "Mastercard" : "Mobile Money"}...` });
  };

  const handleRefundRequest = (txnId: string) => {
    toast({ title: "Refund Requested", description: `Refund request for ${txnId} has been submitted. You'll receive an email confirmation.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent blur-[120px]" />
            <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-secondary blur-[150px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                <CreditCard className="w-4 h-4 inline mr-2" />Payments
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Secure <span className="text-gradient-accent">Payments</span>
              </h1>
              <p className="text-lg text-primary-foreground/70 mt-6 max-w-xl">
                Pay with Mastercard or Mobile Money. Track transactions, download receipts, and manage refunds — all in one place.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Payment & Converter */}
        <section className="py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Make Payment */}
              <motion.div {...fadeUp} className="bg-card rounded-2xl p-8 border shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-card-foreground">Make a Payment</h2>
                    <p className="text-sm text-muted-foreground">3D Secure authenticated</p>
                  </div>
                </div>

                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "momo")} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card" className="gap-2"><CreditCard className="w-4 h-4" /> Mastercard</TabsTrigger>
                    <TabsTrigger value="momo" className="gap-2"><Smartphone className="w-4 h-4" /> Mobile Money</TabsTrigger>
                  </TabsList>
                  <TabsContent value="card" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input placeholder="•••• •••• •••• ••••" className="h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry</Label>
                        <Input placeholder="MM/YY" className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input placeholder="•••" type="password" className="h-12" />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="momo" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input placeholder="+233 XX XXX XXXX" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Network</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["MTN MoMo", "Vodafone Cash", "AirtelTigo"].map((n) => (
                          <Button key={n} variant="outline" size="sm" className="text-xs h-10">{n}</Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2 mb-6">
                  <Label>Amount (USD)</Label>
                  <Input placeholder="0.00" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg font-semibold" />
                </div>

                <Button variant="accent" className="w-full h-12 text-base" onClick={handlePayment}>
                  Pay ${amount || "0.00"}
                </Button>
              </motion.div>

              {/* Currency Converter */}
              <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-8 border shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <ArrowLeftRight className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-card-foreground">Currency Converter</h2>
                    <p className="text-sm text-muted-foreground">Live rate: 1 USD = {EXCHANGE_RATE} GHS</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>From ({convertFrom})</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => {
                        setConvertFrom(convertFrom === "USD" ? "GHS" : "USD");
                        setConvertAmount("");
                      }}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="bg-muted rounded-xl p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Converted Amount ({convertFrom === "USD" ? "GHS" : "USD"})</p>
                    <p className="text-3xl font-display font-bold text-foreground">
                      {convertFrom === "USD" ? "₵" : "$"}{convertedValue}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section className="py-16 bg-muted">
          <div className="container">
            <motion.div {...fadeUp}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Transaction History</h2>
                  <p className="text-muted-foreground text-sm mt-1">View and manage all your payments</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48 sm:w-64 h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["all", "completed", "pending", "failed", "refunded"].map((s) => (
                  <Button
                    key={s}
                    variant={filterStatus === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(s)}
                    className="capitalize text-xs"
                  >
                    {s}
                  </Button>
                ))}
              </div>

              {/* Transactions */}
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="bg-card rounded-xl p-12 border text-center">
                    <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No transactions found.</p>
                  </div>
                ) : (
                  filteredTransactions.map((txn) => {
                    const config = statusConfig[txn.status];
                    const StatusIcon = config.icon;
                    return (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-card transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              {txn.method === "Mastercard" ? <CreditCard className="w-5 h-5 text-primary" /> : <Smartphone className="w-5 h-5 text-primary" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-card-foreground text-sm truncate">{txn.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{txn.id}</span>
                                <span>•</span>
                                <span>{txn.date}</span>
                                <span>•</span>
                                <span>{txn.method}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <p className="text-lg font-display font-bold text-foreground">${txn.amount.toFixed(2)}</p>
                            <Badge variant="outline" className={`gap-1 text-xs ${config.className}`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Download Receipt" onClick={() => toast({ title: "Receipt Downloaded", description: `Receipt for ${txn.id} saved.` })}>
                                <Download className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              {txn.status === "completed" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Request Refund" onClick={() => handleRefundRequest(txn.id)}>
                                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Payments;
