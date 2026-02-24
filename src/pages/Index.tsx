import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <h1 className="text-2xl font-bold text-gradient-gold tracking-tight">ZENOVA</h1>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">4x Growth on Every Deposit</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
            Invest smarter with{" "}
            <span className="text-gradient-gold">Zenova</span>
          </h2>

          <p className="text-lg text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed">
            The premium investment platform that multiplies your deposits and puts your money to work. Secure, transparent, and powerful.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-13 text-base">
                Start Investing <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-24 max-w-4xl w-full"
        >
          {[
            { icon: TrendingUp, title: "4x Growth", desc: "Every deposit is multiplied by 4 in your portfolio" },
            { icon: Shield, title: "Bank-Level Security", desc: "Your assets are protected with enterprise-grade encryption" },
            { icon: Zap, title: "Instant Deposits", desc: "Fund your account securely via PayPal in seconds" },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="glass-card-hover p-6 text-left"
            >
              <feature.icon size={24} className="text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center">
        <p className="text-sm text-muted-foreground">© 2026 Zenova Invest. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
