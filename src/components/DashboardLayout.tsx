import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Shield,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/deposit", label: "Deposit", icon: ArrowDownToLine },
  { to: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { to: "/dashboard/transactions", label: "Transactions", icon: History },
];

const adminItems = [
  { to: "/admin", label: "Admin Panel", icon: Shield },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, isAdmin, profile } = useAuth();
  const location = useLocation();

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/30 backdrop-blur-sm">
        <div className="p-6">
          <Link to="/dashboard">
            <h1 className="text-2xl font-bold text-gradient-gold tracking-tight">ZENOVA</h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {allItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <h1 className="text-xl font-bold text-gradient-gold">ZENOVA</h1>
          </Link>
          <button onClick={signOut} className="text-muted-foreground hover:text-destructive">
            <LogOut size={20} />
          </button>
        </div>
        <nav className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {allItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:p-8 p-4 pt-28 lg:pt-8 overflow-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
