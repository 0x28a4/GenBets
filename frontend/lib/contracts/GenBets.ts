import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import type { Bet, TransactionReceipt } from "./types";

/**
 * GenBets contract class for interacting with the GenLayer GenBets contract
 */
class GenBets {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: testnetBradbury,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    // Don't override endpoint — testnetBradbury chain has the correct RPC built in

    this.client = createClient(config);
  }

  /**
   * Update the address used for transactions
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: testnetBradbury,
      account: address as `0x${string}`,
    };

    this.client = createClient(config);
  }

  /**
   * Get all bets from the contract
   * Calls get_bet_count then loops get_bet to return array
   * @returns Array of bets with their details
   */
  async getBets(): Promise<Bet[]> {
    try {
      const betCount: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_bet_count",
        args: [],
      });

      const count = Number(betCount);
      const bets: Bet[] = [];

      for (let i = 0; i < count; i++) {
        const betData: any = await this.client.readContract({
          address: this.contractAddress,
          functionName: "get_bet",
          args: [i],
        });

        if (betData instanceof Map) {
          const betObj = Array.from((betData as any).entries()).reduce(
            (obj: any, [key, value]: any) => {
              obj[key] = value;
              return obj;
            },
            {} as Record<string, any>
          ) as Record<string, any>;

          bets.push({
            id: i,
            ...betObj,
          } as Bet);
        } else {
          bets.push({
            id: i,
            ...betData,
          } as Bet);
        }
      }

      return bets;
    } catch (error) {
      console.error("Error fetching bets:", error);
      throw new Error("Failed to fetch bets from contract");
    }
  }

  /**
   * Create a new bet
   * @param description - Description of the bet
   * @param resolutionUrl - URL for resolving the bet
   * @param resolutionPrompt - Prompt for AI resolution
   * @param opponent - Opponent's address
   * @param amount - Bet amount (sent as value)
   * @returns Transaction receipt
   */
  async createBet(
    description: string,
    resolutionUrl: string,
    resolutionPrompt: string,
    opponent: string,
    amount: bigint
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "create_bet",
        args: [description, resolutionUrl, resolutionPrompt, opponent],
        value: amount,
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error creating bet:", error);
      throw new Error("Failed to create bet");
    }
  }

  /**
   * Accept a bet
   * @param betId - ID of the bet to accept
   * @param amount - Bet amount (sent as value)
   * @returns Transaction receipt
   */
  async acceptBet(betId: number, amount: bigint): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "accept_bet",
        args: [betId],
        value: amount,
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error accepting bet:", error);
      throw new Error("Failed to accept bet");
    }
  }

  /**
   * Cancel a bet
   * @param betId - ID of the bet to cancel
   * @returns Transaction receipt
   */
  async cancelBet(betId: number): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "cancel_bet",
        args: [betId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error cancelling bet:", error);
      throw new Error("Failed to cancel bet");
    }
  }

  /**
   * Resolve a bet using AI-powered resolution
   * @param betId - ID of the bet to resolve
   * @returns Reasoning string from receipt
   */
  async resolveBet(betId: number): Promise<string> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "resolve_bet",
        args: [betId],
        value: BigInt(0),
      });

      const receipt: any = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      // Extract reasoning from receipt result
      return receipt?.result || "";
    } catch (error) {
      console.error("Error resolving bet:", error);
      throw new Error("Failed to resolve bet");
    }
  }
}

export default GenBets;
