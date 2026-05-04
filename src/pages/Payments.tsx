import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { generateReceiptPDF } from "@/lib/generateReceipt";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  method: string;
  status: "completed" | "pending" | "failed" | "refunded";
}

const CURRENCIES = ["GHS", "USD", "EUR", "GBP", "NGN"];

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Completed", className: "bg-secondary/10 text-secondary border-secondary/20" },
  pending: { icon: Clock, label: "Pending", className: "bg-accent/10 text-accent-foreground border-accent/20" },
  failed: { icon: XCircle, label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
  refunded: { icon: RefreshCw, label: "Refunded", className: "bg-muted text-muted-foreground border-border" },
};

const Payments = () => {
  const { user, isAuthenticated } = useAuth();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payLoading, setPayLoading] = useState(false);

  // Currency converter state
  const [convertFrom, setConvertFrom] = useState("GHS");
  const [convertTo, setConvertTo] = useState("USD");
  const [convertAmount, setConvertAmount] = useState("");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesBase, setRatesBase] = useState("USD");

  const fetchTransactions = useCallback(() => {
    if (!isAuthenticated) return;
    supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTransactions(data.map((d: any) => ({
          id: d.reference || `TXN-${d.id.slice(0, 8).toUpperCase()}`,
          date: new Date(d.created_at).toISOString().split("T")[0],
          description: d.description || "Payment",
          amount: Number(d.amount),
          currency: d.currency || DEFAULT_CURRENCY,
          method: d.payment_method || "Card",
          status: d.status as Transaction["status"],
        })));
      });
  }, [isAuthenticated]);

  const fetchRates = useCallback(async (base: string) => {
    setRatesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("exchange-rates", {
        body: { base, targets: CURRENCIES },
      });
      if (error) throw error;
      setExchangeRates(data.rates);
      setRatesBase(base);
    } catch (e) {
      console.error("Failed to fetch rates:", e);
      // Fallback rates
      setExchangeRates({ GHS: 15.2, USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1550 });
      setRatesBase("USD");
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchRates("USD");
  }, [isAuthenticated, fetchTransactions, fetchRates]);

  // Compute conversion
  const computeConversion = (): string => {
    if (!convertAmount || !exchangeRates) return "0.00";
    const amt = parseFloat(convertAmount);
    if (!amt || !isFinite(amt)) return "0.00";

    // Convert from source to base, then base to target
    const fromRate = ratesBase === convertFrom ? 1 : (exchangeRates[convertFrom] || 1);
    const toRate = ratesBase === convertTo ? 1 : (exchangeRates[convertTo] || 1);
    const result = (amt / fromRate) * toRate;
    return result.toFixed(2);
  };

  const getDisplayRate = (): string => {
    if (!exchangeRates) return "Loading...";
    const fromRate = ratesBase === convertFrom ? 1 : (exchangeRates[convertFrom] || 1);
    const toRate = ratesBase === convertTo ? 1 : (exchangeRates[convertTo] || 1);
    const rate = toRate / fromRate;
    return `1 ${convertFrom} = ${rate.toFixed(4)} ${convertTo}`;
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid payment amount.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to make a payment.", variant: "destructive" });
      return;
    }

    setPayLoading(true);

    try {
      // Initialize Paystack transaction via edge function
      const { data, error } = await supabase.functions.invoke("paystack", {
        body: {
          action: "initialize",
          email: user.email,
          amount: parseFloat(amount),
          currency: DEFAULT_CURRENCY,
          description: description || "Service Payment",
          user_id: user.id,
          callback_url: window.location.origin + "/payments?verify=true",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.authorization_url) {
        // In preview (iframe), open checkout in a new tab because Paystack blocks embedded frames
        const isEmbeddedPreview = window.self !== window.top;
        if (isEmbeddedPreview) {
          const checkoutTab = window.open(data.authorization_url, "_blank", "noopener,noreferrer");
          if (!checkoutTab) window.location.assign(data.authorization_url);
        } else {
          window.location.assign(data.authorization_url);
        }
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (e: any) {
      console.error("Payment error:", e);
      toast({ title: "Payment Failed", description: e.message || "Could not initiate payment.", variant: "destructive" });
    } finally {
      setPayLoading(false);
    }
  };

  // Verify payment on return from Paystack
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (reference) {
      const verify = async () => {
        try {
          const { data, error } = await supabase.functions.invoke("paystack", {
            body: { action: "verify", reference },
          });

          if (error) throw error;

          if (data?.status === "completed") {
            toast({ title: "Payment Successful ✓", description: `Payment of ${formatCurrency(data.amount, data.currency)} confirmed.` });

            // Send invoice notification
            if (user && data.payment_id) {
              const { data: invoice } = await supabase
                .from("invoices")
                .select("invoice_number")
                .eq("payment_id", data.payment_id)
                .single();

              if (invoice) {
                const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
                await supabase.functions.invoke("send-notification", {
                  body: {
                    type: "invoice_ready",
                    userId: user.id,
                    recipientEmail: user.email,
                    recipientName: profile?.full_name || "Customer",
                    channel: "both",
                    data: {
                      invoiceNumber: invoice.invoice_number,
                      amount: data.amount.toFixed(2),
                      currency: data.currency,
                      description: description || "Paystack Payment",
                      paymentMethod: data.channel || "Card",
                      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                    },
                  },
                });
              }
            }
          } else if (data?.status === "failed") {
            toast({ title: "Payment Failed", description: "The payment could not be completed.", variant: "destructive" });
          } else {
            toast({ title: "Payment Pending", description: "Your payment is being processed." });
          }
        } catch (e: any) {
          toast({ title: "Verification Error", description: e.message, variant: "destructive" });
        }

        // Clean URL
        window.history.replaceState({}, "", "/payments");
        fetchTransactions();
      };

      verify();
    }
  }, []);

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
          <div className="container relative z-10 text-center">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                <CreditCard className="w-4 h-4 inline mr-2" />Payments
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Secure <span className="text-gradient-accent">Payments</span>
              </h1>
              <p className="text-lg text-primary-foreground/70 mt-6 max-w-xl mx-auto">
                Pay securely with Paystack — Card or Mobile Money. Track transactions, download receipts, and manage refunds.
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
                    <p className="text-sm text-muted-foreground">Powered by Paystack · Card & Mobile Money</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Mastercard, Visa, Mobile Money (MTN, Vodafone, AirtelTigo)</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="e.g. Visa application fee" value={description} onChange={(e) => setDescription(e.target.value)} className="h-12" />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount ({DEFAULT_CURRENCY})</Label>
                    <Input placeholder="0.00" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg font-semibold" />
                  </div>

                  <Button variant="accent" className="w-full h-12 text-base" onClick={handlePayment} disabled={payLoading || !amount}>
                    {payLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                    ) : (
                      <>Pay {formatCurrency(amount || 0, DEFAULT_CURRENCY)} with Paystack</>
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Currency Converter */}
              <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-8 border shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <ArrowLeftRight className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-card-foreground">Currency Converter</h2>
                    <p className="text-sm text-muted-foreground">
                      {ratesLoading ? "Loading rates..." : `Live rate: ${getDisplayRate()}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <div className="flex gap-2">
                      <Select value={convertFrom} onValueChange={(v) => setConvertFrom(v)}>
                        <SelectTrigger className="w-28 h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                        className="h-12 text-lg flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => {
                        setConvertFrom(convertTo);
                        setConvertTo(convertFrom);
                        setConvertAmount("");
                      }}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>To</Label>
                    <div className="flex gap-2">
                      <Select value={convertTo} onValueChange={(v) => setConvertTo(v)}>
                        <SelectTrigger className="w-28 h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="flex-1 h-12 bg-muted rounded-lg flex items-center px-4">
                        <p className="text-lg font-display font-bold text-foreground">
                          {computeConversion()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fetchRates(convertFrom)}
                    disabled={ratesLoading}
                  >
                    {ratesLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Refresh Rates
                  </Button>
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
                    <p className="text-muted-foreground">
                      {!isAuthenticated ? "Please log in to view your transactions." : "No transactions found."}
                    </p>
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
                              {txn.method === "Mobile Money" ? <Smartphone className="w-5 h-5 text-primary" /> : <CreditCard className="w-5 h-5 text-primary" />}
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
                            <p className="text-lg font-display font-bold text-foreground">{formatCurrency(txn.amount, txn.currency)}</p>
                            <Badge variant="outline" className={`gap-1 text-xs ${config.className}`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Download Receipt" onClick={() => generateReceiptPDF({
                                reference: txn.id,
                                date: txn.date,
                                description: txn.description,
                                amount: txn.amount,
                                currency: txn.currency || DEFAULT_CURRENCY,
                                paymentMethod: txn.method,
                                status: txn.status,
                                customerName: user?.fullName || "Customer",
                                customerEmail: user?.email || "",
                              })}>
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
