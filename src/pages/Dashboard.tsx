import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUp, ArrowDownToLine, ArrowUpFromLine, DollarSign, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideAmounts, setHideAmounts] = useState(false);

  const mask = (val: string) => hideAmounts ? "••••••" : val;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setTransactions(data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const balance = Number(profile?.balance || 0);

  const stats = [
    {
      label: "Total Balance",
      value: mask(`$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`),
      icon: DollarSign,
      accent: true,
    },
    {
      label: "Total Deposits",
      value: transactions.filter((t) => t.type === "deposit" && t.status === "completed").length.toString(),
      icon: ArrowDownToLine,
    },
    {
      label: "Total Withdrawals",
      value: transactions.filter((t) => t.type === "withdrawal").length.toString(),
      icon: ArrowUpFromLine,
    },
    {
      label: "Growth Factor",
      value: "4x",
      icon: TrendingUp,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="text-gradient-gold">{profile?.full_name || "Investor"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's your portfolio overview</p>
        </div>
        <button
          onClick={() => setHideAmounts(!hideAmounts)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={hideAmounts ? "Show amounts" : "Hide amounts"}
        >
          {hideAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-5 ${stat.accent ? "gold-glow border-primary/20" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
              <stat.icon size={18} className={stat.accent ? "text-primary" : "text-muted-foreground"} />
            </div>
            <p className={`text-2xl font-bold ${stat.accent ? "text-primary" : "text-foreground"}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/dashboard/deposit" className="glass-card-hover p-5 group block">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ArrowDownToLine className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Make a Deposit</h3>
              <p className="text-sm text-muted-foreground">Fund your account via PayPal</p>
            </div>
          </div>
        </Link>
        <Link to="/dashboard/withdraw" className="glass-card-hover p-5 group block">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <ArrowUpFromLine className="text-success" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Request Withdrawal</h3>
              <p className="text-sm text-muted-foreground">
                {balance >= 20000 ? "You're eligible to withdraw" : hideAmounts ? "••••••" : `$${(20000 - balance).toLocaleString()} more to unlock`}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Link to="/dashboard/transactions" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse-gold">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Start by making a deposit.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    tx.type === "deposit" ? "bg-primary/10" : "bg-success/10"
                  }`}>
                    {tx.type === "deposit" ? (
                      <ArrowDownToLine size={16} className="text-primary" />
                    ) : (
                      <ArrowUpFromLine size={16} className="text-success" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {mask(`$${Number(tx.displayed_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    tx.status === "completed" ? "bg-success/10 text-success" :
                    tx.status === "rejected" ? "bg-destructive/10 text-destructive" :
                    "bg-warning/10 text-warning"
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
