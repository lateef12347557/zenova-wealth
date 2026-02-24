import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Check, X, DollarSign, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { motion } from "framer-motion";

const Admin = () => {
  const [tab, setTab] = useState<"users" | "withdrawals" | "transactions">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState("");

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const fetchWithdrawals = async () => {
    const { data: wData } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });
    // Enrich with profile data
    if (wData) {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setWithdrawals(wData.map(w => ({ ...w, profile: profileMap.get(w.user_id) })));
    }
  };

  const fetchAllTransactions = async () => {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (txData) {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setAllTransactions(txData.map(tx => ({ ...tx, profile: profileMap.get(tx.user_id) })));
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchWithdrawals(), fetchAllTransactions()]);
      setLoading(false);
    };
    load();
  }, []);

  const updateBalance = async (userId: string) => {
    const val = parseFloat(newBalance);
    if (isNaN(val) || val < 0) {
      toast.error("Invalid balance");
      return;
    }
    const { error } = await supabase.from("profiles").update({ balance: val }).eq("user_id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Balance updated");
    setEditingUser(null);
    setNewBalance("");
    fetchUsers();
  };

  const handleWithdrawal = async (id: string, userId: string, amount: number, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("withdrawal_requests")
      .update({ status: action })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }

    // Update transaction status too
    await supabase
      .from("transactions")
      .update({ status: action === "approved" ? "completed" : "rejected" })
      .eq("user_id", userId)
      .eq("type", "withdrawal")
      .eq("status", "pending");

    if (action === "approved") {
      const { data: profile } = await supabase.from("profiles").select("balance").eq("user_id", userId).single();
      const newBal = Math.max(0, Number(profile?.balance || 0) - amount);
      await supabase.from("profiles").update({ balance: newBal }).eq("user_id", userId);
    }

    toast.success(`Withdrawal ${action}`);
    fetchWithdrawals();
    fetchUsers();
    fetchAllTransactions();
  };

  const tabs = [
    { key: "users" as const, label: "Users", icon: Users },
    { key: "withdrawals" as const, label: "Withdrawals", icon: ArrowUpFromLine },
    { key: "transactions" as const, label: "Transactions", icon: DollarSign },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage users, withdrawals, and transactions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground animate-pulse-gold">Loading...</div>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* USERS TAB */}
          {tab === "users" && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="p-4 text-muted-foreground font-medium">Name</th>
                      <th className="p-4 text-muted-foreground font-medium">Email</th>
                      <th className="p-4 text-muted-foreground font-medium">Balance</th>
                      <th className="p-4 text-muted-foreground font-medium">Joined</th>
                      <th className="p-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4 text-foreground font-medium">{u.full_name || "—"}</td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4">
                          {editingUser === u.user_id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={newBalance}
                                onChange={(e) => setNewBalance(e.target.value)}
                                className="zenova-input w-32 h-8 text-sm"
                                placeholder={String(u.balance)}
                              />
                              <Button size="sm" onClick={() => updateBalance(u.user_id)} className="h-8 bg-primary text-primary-foreground">Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingUser(null)} className="h-8">Cancel</Button>
                            </div>
                          ) : (
                            <span className="text-primary font-semibold">
                              ${Number(u.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          {editingUser !== u.user_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setEditingUser(u.user_id); setNewBalance(String(u.balance)); }}
                              className="h-8 text-xs text-muted-foreground hover:text-primary"
                            >
                              Edit Balance
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WITHDRAWALS TAB */}
          {tab === "withdrawals" && (
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">No withdrawal requests</div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {w.profile?.full_name || "Unknown"} — {w.profile?.email}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${Number(w.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {w.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleWithdrawal(w.id, w.user_id, Number(w.amount), "approved")}
                            className="bg-success text-success-foreground hover:bg-success/90 h-9"
                          >
                            <Check size={14} className="mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleWithdrawal(w.id, w.user_id, Number(w.amount), "rejected")}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9"
                          >
                            <X size={14} className="mr-1" /> Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          w.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        }`}>
                          {w.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {tab === "transactions" && (
            <div className="glass-card divide-y divide-border">
              {allTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No transactions</div>
              ) : (
                allTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4">
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
                        <p className="text-sm font-medium text-foreground">
                          {tx.profile?.full_name || "Unknown"} — <span className="capitalize">{tx.type}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ${Number(tx.displayed_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                ))
              )}
            </div>
          )}
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Admin;
