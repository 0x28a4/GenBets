"use client";

import { GenBetsNavbar } from "@/components/GenBetsNavbar";
import { GenBetsTable } from "@/components/GenBetsTable";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <GenBetsNavbar />

      {/* Main Content - Padding to account for fixed navbar */}
      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-clip-text text-transparent gradient-purple-pink">
                GenBets
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered subjective betting on GenLayer blockchain.
              <br />
              Create bets, stake ETH, and let AI resolve the outcome.
            </p>
          </div>

          {/* Main Content - Bets Table */}
          <div className="animate-slide-up">
            <GenBetsTable />
          </div>

          {/* How it Works Section */}
          <div className="mt-10 brand-card p-6 md:p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold mb-6">How it Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">1. Create a Bet</div>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet and create a bet with a description, resolution URL, and AI prompt.
                  Choose your opponent and stake amount.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">2. Accept &amp; Stake</div>
                <p className="text-sm text-muted-foreground">
                  The designated opponent accepts the bet by matching your stake.
                  Both sides put ETH on the line for a fair wager.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">3. AI Resolution</div>
                <p className="text-sm text-muted-foreground">
                  When it&apos;s time, anyone can trigger resolution. GenLayer&apos;s AI reads the source URL,
                  evaluates the prompt, and determines the winner automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Powered by GenLayer
            </a>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Studio
            </a>
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com/genlayerlabs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
