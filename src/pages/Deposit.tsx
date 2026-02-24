import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowDownToLine, Zap } from "lucide-react";

const Deposit = () => {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (depositAmount > 100000) {
      toast.error("Maximum deposit is $100,000");
      return;
    }

    setLoading(true);
    try {
      const displayedAmount = depositAmount * 4;

      // Create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "deposit",
        amount: depositAmount,
        displayed_amount: displayedAmount,
        status: "completed",
        paypal_transaction_id: `PP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      if (txError) throw txError;

      // Update balance
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("user_id", user!.id)
        .single();

      const newBalance = Number(currentProfile?.balance || 0) + displayedAmount;

      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("user_id", user!.id);

      if (balanceError) throw balanceError;

      await refreshProfile();
      toast.success(`Successfully deposited $${depositAmount.toFixed(2)}! Your balance increased by $${displayedAmount.toFixed(2)} (4x growth)`);
      setAmount("");
    } catch (error: any) {
      toast.error(error.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const presets = [100, 500, 1000, 5000];

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Make a Deposit</h1>
          <p className="text-muted-foreground mt-1">Fund your account securely</p>
        </div>

        {/* Growth info */}
        <div className="glass-card p-4 mb-6 border-primary/20 gold-glow">
          <div className="flex items-center gap-3">
            <Zap className="text-primary" size={20} />
            <div>
              <p className="text-sm font-medium text-foreground">4x Growth Applied</p>
              <p className="text-xs text-muted-foreground">Every deposit is multiplied by 4 in your portfolio</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleDeposit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Deposit Amount (USD)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                max="100000"
                step="0.01"
                className="zenova-input text-xl h-14 font-semibold"
                required
              />
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p.toString())}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all"
                >
                  ${p.toLocaleString()}
                </button>
              ))}
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="text-foreground">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Growth (4x)</span>
                  <span className="text-primary font-semibold">
                    +${(parseFloat(amount) * 3).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-sm font-medium text-foreground">Added to Balance</span>
                  <span className="text-lg font-bold text-primary">
                    ${(parseFloat(amount) * 4).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12"
            >
              {loading ? (
                <span className="animate-pulse-gold">Processing...</span>
              ) : (
                <>
                  <ArrowDownToLine className="mr-2" size={18} />
                  Deposit via PayPal
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Deposit;
