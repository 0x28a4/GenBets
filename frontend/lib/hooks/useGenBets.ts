"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import GenBets from "../contracts/GenBets";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { Bet } from "../contracts/types";

/**
 * Hook to get the GenBets contract instance
 *
 * Returns null if contract address is not configured.
 * The contract instance is recreated whenever the wallet address changes.
 * Read-only operations (getBets) work without a connected wallet.
 * Write operations (createBet, acceptBet, cancelBet, resolveBet) require a connected wallet
 * and will fail if the address is null. Defensive validation is added in the mutation hooks.
 */
export function useGenBetsContract(): GenBets | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    // Validate contract address is configured
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.",
        {
          label: "Setup Guide",
          onClick: () => window.open("/docs/setup", "_blank")
        }
      );
      // Return null to indicate contract is not available
      return null;
    }

    // Contract instance is recreated when address changes to ensure
    // the genlayer-js client is properly configured with the current account
    return new GenBets(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

/**
 * Hook to fetch all bets
 * Refetches on window focus and after mutations
 * Returns empty array if contract is not configured
 */
export function useBets() {
  const contract = useGenBetsContract();

  return useQuery<Bet[], Error>({
    queryKey: ["bets"],
    queryFn: () => {
      if (!contract) {
        return Promise.resolve([]);
      }
      return contract.getBets();
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract, // Only run query if contract is available
  });
}

/**
 * Hook to create a new bet
 */
export function useCreateBet() {
  const contract = useGenBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      description,
      resolutionUrl,
      resolutionPrompt,
      opponent,
      amount,
    }: {
      description: string;
      resolutionUrl: string;
      resolutionPrompt: string;
      opponent: string;
      amount: bigint;
    }) => {
      if (!contract) {
        throw new Error("Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.");
      }
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to create a bet.");
      }
      setIsCreating(true);
      return contract.createBet(description, resolutionUrl, resolutionPrompt, opponent, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      setIsCreating(false);
      success("Bet created successfully!", {
        description: "Your bet has been recorded on the blockchain."
      });
    },
    onError: (err: any) => {
      console.error("Error creating bet:", err);
      setIsCreating(false);
      error("Failed to create bet", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isCreating,
    createBet: mutation.mutate,
    createBetAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to accept a bet
 */
export function useAcceptBet() {
  const contract = useGenBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isAccepting, setIsAccepting] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      betId,
      amount,
    }: {
      betId: number;
      amount: bigint;
    }) => {
      if (!contract) {
        throw new Error("Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.");
      }
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to accept a bet.");
      }
      setIsAccepting(true);
      return contract.acceptBet(betId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      setIsAccepting(false);
      success("Bet accepted successfully!", {
        description: "You have joined the bet."
      });
    },
    onError: (err: any) => {
      console.error("Error accepting bet:", err);
      setIsAccepting(false);
      error("Failed to accept bet", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isAccepting,
    acceptBet: mutation.mutate,
    acceptBetAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to cancel a bet
 */
export function useCancelBet() {
  const contract = useGenBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);

  const mutation = useMutation({
    mutationFn: async (betId: number) => {
      if (!contract) {
        throw new Error("Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.");
      }
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to cancel a bet.");
      }
      setIsCancelling(true);
      return contract.cancelBet(betId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      setIsCancelling(false);
      success("Bet cancelled successfully!", {
        description: "Your bet has been cancelled and funds returned."
      });
    },
    onError: (err: any) => {
      console.error("Error cancelling bet:", err);
      setIsCancelling(false);
      error("Failed to cancel bet", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isCancelling,
    cancelBet: mutation.mutate,
    cancelBetAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to resolve a bet
 */
export function useResolveBet() {
  const contract = useGenBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isResolving, setIsResolving] = useState(false);
  const [resolvingBetId, setResolvingBetId] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (betId: number) => {
      if (!contract) {
        throw new Error("Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.");
      }
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to resolve a bet.");
      }
      setIsResolving(true);
      setResolvingBetId(betId);
      setReasoning(null);
      return contract.resolveBet(betId);
    },
    onSuccess: (result: string) => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      setIsResolving(false);
      setResolvingBetId(null);
      setReasoning(result);
      success("Bet resolved successfully!", {
        description: "The winner has been determined."
      });
    },
    onError: (err: any) => {
      console.error("Error resolving bet:", err);
      setIsResolving(false);
      setResolvingBetId(null);
      setReasoning(null);
      error("Failed to resolve bet", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isResolving,
    resolvingBetId,
    reasoning,
    resolveBet: mutation.mutate,
    resolveBetAsync: mutation.mutateAsync,
  };
}
