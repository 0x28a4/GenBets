/**
 * TypeScript types for GenBets contract
 */

export interface Bet {
  id: number;
  creator: string;
  opponent: string;
  description: string;
  resolution_url: string;
  resolution_prompt: string;
  amount: number;
  status: string;
  winner: string;
}

export interface TransactionReceipt {
  hash: string;
  status: string;
  result?: any;
}
