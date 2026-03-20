"use client";

import { Loader2, Trophy, Clock, AlertCircle, CheckCircle, XCircle, Play } from "lucide-react";
import { useBets, useAcceptBet, useCancelBet, useResolveBet } from "@/lib/hooks/useGenBets";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Bet } from "@/lib/contracts/types";

function formatAmount(amount: number): string {
  const eth = amount / 1e18;
  return eth.toFixed(eth < 0.01 ? 6 : 4);
}

type BetStatus = "open" | "accepted" | "resolved" | "cancelled";

export function GenBetsTable() {
  const { data: bets, isLoading, isError } = useBets();
  const { address, isConnected, isLoading: isWalletLoading } = useWallet();
  const { acceptBet, isAccepting } = useAcceptBet();
  const { cancelBet, isCancelling } = useCancelBet();
  const { resolveBet, isResolving, resolvingBetId } = useResolveBet();

  const handleAccept = (betId: number, amount: number) => {
    if (!address) {
      error("Please connect your wallet to accept bets");
      return;
    }
    const confirmed = confirm("Are you sure you want to accept this bet? You will stake the same amount.");
    if (confirmed) {
      acceptBet({ betId, amount: BigInt(amount) });
    }
  };

  const handleCancel = (betId: number) => {
    if (!address) {
      error("Please connect your wallet to cancel bets");
      return;
    }
    const confirmed = confirm("Are you sure you want to cancel this bet? Your stake will be returned.");
    if (confirmed) {
      cancelBet(betId);
    }
  };

  const handleResolve = (betId: number) => {
    if (!address) {
      error("Please connect your wallet to resolve bets");
      return;
    }
    const confirmed = confirm("Are you sure you want to resolve this bet? AI will determine the outcome.");
    if (confirmed) {
      resolveBet(betId);
    }
  };

  if (isLoading) {
    return (
      <div className="brand-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading bets...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="brand-card p-8">
        <div className="text-center">
          <p className="text-destructive">Failed to load bets. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-3">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-bold">No Bets Yet</h3>
          <p className="text-muted-foreground">
            Be the first to create an AI-powered subjective bet!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-card p-6 overflow-hidden animate-slide-up">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stake
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Creator
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Opponent
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bets.map((bet: Bet, index: number) => (
              <BetRow
                key={bet.id}
                bet={bet}
                index={index}
                currentAddress={address}
                isConnected={isConnected}
                isWalletLoading={isWalletLoading}
                onAccept={handleAccept}
                onCancel={handleCancel}
                onResolve={handleResolve}
                isAccepting={isAccepting}
                isCancelling={isCancelling}
                isResolving={isResolving && resolvingBetId === bet.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BetRowProps {
  bet: Bet;
  index: number;
  currentAddress: string | null;
  isConnected: boolean;
  isWalletLoading: boolean;
  onAccept: (betId: number, amount: number) => void;
  onCancel: (betId: number) => void;
  onResolve: (betId: number) => void;
  isAccepting: boolean;
  isCancelling: boolean;
  isResolving: boolean;
}

function getStatusBadge(status: BetStatus) {
  switch (status) {
    case "open":
      return (
        <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Open
        </Badge>
      );
    case "accepted":
      return (
        <Badge variant="outline" className="text-blue-400 border-blue-500/30">
          <Play className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      );
    case "resolved":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolved
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="text-red-400 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {status}
        </Badge>
      );
  }
}

function BetRow({
  bet,
  index,
  currentAddress,
  isConnected,
  isWalletLoading,
  onAccept,
  onCancel,
  onResolve,
  isAccepting,
  isCancelling,
  isResolving,
}: BetRowProps) {
  const isCreator = currentAddress?.toLowerCase() === bet.creator?.toLowerCase();
  const isOpponent = currentAddress?.toLowerCase() === bet.opponent?.toLowerCase();

  const canAccept =
    isConnected &&
    currentAddress &&
    !isWalletLoading &&
    bet.status === "open" &&
    isOpponent;

  const canCancel =
    isConnected &&
    currentAddress &&
    !isWalletLoading &&
    bet.status === "open" &&
    isCreator;

  const canResolve =
    isConnected &&
    currentAddress &&
    !isWalletLoading &&
    bet.status === "accepted";

  return (
    <tr className="group hover:bg-white/5 transition-colors animate-fade-in">
      <td className="px-4 py-4">
        <span className="text-sm text-muted-foreground font-mono">{index + 1}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium max-w-[200px] truncate block" title={bet.description}>
          {bet.description}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-semibold text-accent">
          {formatAmount(bet.amount)} ETH
        </span>
      </td>
      <td className="px-4 py-4">
        {getStatusBadge(bet.status)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <AddressDisplay address={bet.creator} maxLength={10} showCopy={true} />
          {isCreator && (
            <Badge variant="secondary" className="text-xs">
              You
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {bet.opponent ? (
            <>
              <AddressDisplay address={bet.opponent} maxLength={10} showCopy={true} />
              {isOpponent && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">--</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {canAccept && (
            <Button
              onClick={() => onAccept(bet.id, bet.amount)}
              disabled={isAccepting}
              size="sm"
              variant="gradient"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept"
              )}
            </Button>
          )}
          {canCancel && (
            <Button
              onClick={() => onCancel(bet.id)}
              disabled={isCancelling}
              size="sm"
              variant="destructive"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel"
              )}
            </Button>
          )}
          {canResolve && (
            <Button
              onClick={() => onResolve(bet.id)}
              disabled={isResolving}
              size="sm"
              variant="blue"
            >
              {isResolving ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Resolve"
              )}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
