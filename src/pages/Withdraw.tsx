import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowUpFromLine, AlertTriangle } from "lucide-react";

const Withdraw = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const balance = Number(profile?.balance || 0);
  const canWithdraw = balance >= 20000;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw) {
      toast.error("Minimum balance of $20,000 required for withdrawal");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (withdrawAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: user!.id,
        amount: withdrawAmount,
        status: "pending",
      });

      if (error) throw error;

      // Also create a transaction record
      await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "withdrawal",
        amount: withdrawAmount,
        displayed_amount: withdrawAmount,
        status: "pending",
      });

      toast.success("Withdrawal request submitted! Awaiting admin approval.");
      setAmount("");
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Request Withdrawal</h1>
          <p className="text-muted-foreground mt-1">Withdraw funds from your account</p>
        </div>

        {!canWithdraw && (
          <div className="glass-card p-4 mb-6 border-warning/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-warning" size={20} />
              <div>
                <p className="text-sm font-medium text-foreground">Withdrawal Locked</p>
                <p className="text-xs text-muted-foreground">
                  Your balance must reach $20,000 before you can withdraw. You need ${(20000 - balance).toLocaleString("en-US", { minimumFractionDigits: 2 })} more.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card p-6">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Available Balance</span>
            <p className="text-2xl font-bold text-primary mt-1">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Withdrawal Amount (USD)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                max={balance}
                step="0.01"
                className="zenova-input text-xl h-14 font-semibold"
                required
                disabled={!canWithdraw}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Withdrawal requests require admin approval. Processing typically takes 1-3 business days.
            </p>

            <Button
              type="submit"
              disabled={loading || !canWithdraw}
              className="w-full bg-success text-success-foreground hover:bg-success/90 font-semibold h-12 disabled:opacity-40"
            >
              {loading ? (
                <span className="animate-pulse-gold">Submitting...</span>
              ) : (
                <>
                  <ArrowUpFromLine className="mr-2" size={18} />
                  Submit Withdrawal Request
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Withdraw;
