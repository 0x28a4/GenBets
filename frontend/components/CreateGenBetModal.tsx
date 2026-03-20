"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, FileText, Link, MessageSquare, User, Coins } from "lucide-react";
import { useCreateBet } from "@/lib/hooks/useGenBets";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function CreateGenBetModal() {
  const { isConnected, address, isLoading } = useWallet();
  const { createBet, isCreating, isSuccess } = useCreateBet();

  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [resolutionUrl, setResolutionUrl] = useState("");
  const [resolutionPrompt, setResolutionPrompt] = useState("");
  const [opponentAddress, setOpponentAddress] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");

  const [errors, setErrors] = useState({
    description: "",
    resolutionUrl: "",
    resolutionPrompt: "",
    opponentAddress: "",
    stakeAmount: "",
  });

  // Auto-close modal when wallet disconnects
  useEffect(() => {
    if (!isConnected && isOpen && !isCreating) {
      setIsOpen(false);
    }
  }, [isConnected, isOpen, isCreating]);

  const validateForm = (): boolean => {
    const newErrors = {
      description: "",
      resolutionUrl: "",
      resolutionPrompt: "",
      opponentAddress: "",
      stakeAmount: "",
    };

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!resolutionUrl.trim()) {
      newErrors.resolutionUrl = "Resolution URL is required";
    } else {
      try {
        new URL(resolutionUrl);
      } catch {
        newErrors.resolutionUrl = "Please enter a valid URL";
      }
    }

    if (!resolutionPrompt.trim()) {
      newErrors.resolutionPrompt = "Resolution prompt is required";
    }

    if (!opponentAddress.trim()) {
      newErrors.opponentAddress = "Opponent address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(opponentAddress)) {
      newErrors.opponentAddress = "Please enter a valid Ethereum address";
    } else if (opponentAddress.toLowerCase() === address?.toLowerCase()) {
      newErrors.opponentAddress = "You cannot bet against yourself";
    }

    if (!stakeAmount.trim()) {
      newErrors.stakeAmount = "Stake amount is required";
    } else if (isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) {
      newErrors.stakeAmount = "Please enter a valid positive amount";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      error("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Convert stake amount to wei (BigInt)
    const stakeWei = BigInt(Math.floor(Number(stakeAmount) * 1e18));

    createBet({
      description,
      resolutionUrl,
      resolutionPrompt,
      opponent: opponentAddress,
      amount: stakeWei,
    });
  };

  const resetForm = () => {
    setDescription("");
    setResolutionUrl("");
    setResolutionPrompt("");
    setOpponentAddress("");
    setStakeAmount("");
    setErrors({
      description: "",
      resolutionUrl: "",
      resolutionPrompt: "",
      opponentAddress: "",
      stakeAmount: "",
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isCreating) {
      resetForm();
    }
    setIsOpen(open);
  };

  // Reset form and close modal on successful bet creation
  useEffect(() => {
    if (isSuccess) {
      resetForm();
      setIsOpen(false);
    }
  }, [isSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gradient" disabled={!isConnected || !address || isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="brand-card border-2 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create GenBet</DialogTitle>
          <DialogDescription>
            Create an AI-powered subjective bet with a custom resolution prompt
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 !text-white" />
              Description
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Will Bitcoin hit $100k by end of March?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: "" });
              }}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Resolution URL */}
          <div className="space-y-2">
            <Label htmlFor="resolutionUrl" className="flex items-center gap-2">
              <Link className="w-4 h-4 !text-white" />
              Resolution URL
            </Label>
            <Input
              id="resolutionUrl"
              type="text"
              placeholder="https://example.com/source-of-truth"
              value={resolutionUrl}
              onChange={(e) => {
                setResolutionUrl(e.target.value);
                setErrors({ ...errors, resolutionUrl: "" });
              }}
              className={errors.resolutionUrl ? "border-destructive" : ""}
            />
            {errors.resolutionUrl && (
              <p className="text-xs text-destructive">{errors.resolutionUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The URL the AI will check to determine the outcome
            </p>
          </div>

          {/* Resolution Prompt */}
          <div className="space-y-2">
            <Label htmlFor="resolutionPrompt" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 !text-white" />
              Resolution Prompt
            </Label>
            <textarea
              id="resolutionPrompt"
              placeholder="Determine whether the bet condition was met based on the content of the provided URL..."
              value={resolutionPrompt}
              onChange={(e) => {
                setResolutionPrompt(e.target.value);
                setErrors({ ...errors, resolutionPrompt: "" });
              }}
              rows={3}
              className={`w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none ${
                errors.resolutionPrompt ? "border-destructive" : ""
              }`}
            />
            {errors.resolutionPrompt && (
              <p className="text-xs text-destructive">{errors.resolutionPrompt}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Instructions for the AI to evaluate the bet outcome
            </p>
          </div>

          {/* Opponent Address */}
          <div className="space-y-2">
            <Label htmlFor="opponentAddress" className="flex items-center gap-2">
              <User className="w-4 h-4 !text-white" />
              Opponent Address
            </Label>
            <Input
              id="opponentAddress"
              type="text"
              placeholder="0x..."
              value={opponentAddress}
              onChange={(e) => {
                setOpponentAddress(e.target.value);
                setErrors({ ...errors, opponentAddress: "" });
              }}
              className={`font-mono ${errors.opponentAddress ? "border-destructive" : ""}`}
            />
            {errors.opponentAddress && (
              <p className="text-xs text-destructive">{errors.opponentAddress}</p>
            )}
          </div>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stakeAmount" className="flex items-center gap-2">
              <Coins className="w-4 h-4 !text-white" />
              Stake Amount (ETH)
            </Label>
            <Input
              id="stakeAmount"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.01"
              value={stakeAmount}
              onChange={(e) => {
                setStakeAmount(e.target.value);
                setErrors({ ...errors, stakeAmount: "" });
              }}
              className={errors.stakeAmount ? "border-destructive" : ""}
            />
            {errors.stakeAmount && (
              <p className="text-xs text-destructive">{errors.stakeAmount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Both you and your opponent will stake this amount
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Bet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
