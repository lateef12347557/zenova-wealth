import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal">("all");

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("type", filter);
      }

      const { data } = await query;
      setTransactions(data || []);
      setLoading(false);
    };
    fetchTransactions();
  }, [user, filter]);

  const filters = [
    { key: "all" as const, label: "All" },
    { key: "deposit" as const, label: "Deposits" },
    { key: "withdrawal" as const, label: "Withdrawals" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground mt-1">View all your transactions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setLoading(true); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="glass-card divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse-gold">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No transactions found</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tx.type === "deposit" ? "bg-primary/10" : "bg-success/10"
                }`}>
                  {tx.type === "deposit" ? (
                    <ArrowDownToLine size={18} className="text-primary" />
                  ) : (
                    <ArrowUpFromLine size={18} className="text-success" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                  {tx.paypal_transaction_id && (
                    <p className="text-xs text-muted-foreground font-mono">{tx.paypal_transaction_id}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {tx.type === "deposit" ? "+" : "-"}${Number(tx.displayed_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                {tx.type === "deposit" && (
                  <p className="text-xs text-muted-foreground">
                    Base: ${Number(tx.amount).toFixed(2)}
                  </p>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  tx.status === "completed" ? "bg-success/10 text-success" :
                  tx.status === "rejected" ? "bg-destructive/10 text-destructive" :
                  "bg-warning/10 text-warning"
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
