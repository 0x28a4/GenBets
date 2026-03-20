# GenBets - AI-Powered P2P Betting on GenLayer

A peer-to-peer betting platform where friends bet on subjective real-world outcomes and AI validators settle the result. Built on [GenLayer](https://genlayer.com) — the first AI-native blockchain.

**Tutorial Series:** From Zero to GenLayer (3-part tutorial on [Dev.to](https://dev.to/fran6))

## How It Works

1. **Create a Bet** — Define a description, a URL to check, and criteria for the AI to evaluate
2. **Opponent Accepts** — The named opponent accepts the bet
3. **AI Resolves** — Anyone triggers resolution. The contract fetches live web data, an LLM evaluates it against the criteria, and validators reach consensus
4. **Winner Recorded** — The winner is stored on-chain, verified by multiple AI validators

**Example:** "Inception has above 80% on Rotten Tomatoes" — the contract fetches the Rotten Tomatoes page, the AI reads the score, validators agree, and the winner is recorded.

## Project Structure

```
contracts/genbets.py          # GenBets Intelligent Contract (Python)
frontend/                      # Next.js 15 frontend (TypeScript, TanStack Query)
deploy/deployScript.ts         # Deployment script
blog/                          # 3-part tutorial blog posts
```

## GenLayer Concepts Demonstrated

- **Intelligent Contracts** — Python smart contracts with LLM and web access
- **`gl.nondet.web.render()`** — Fetch and render live web pages from on-chain code
- **`gl.nondet.exec_prompt()`** — Call LLMs directly from the contract
- **`gl.eq_principle.strict_eq()`** — Validator consensus on non-deterministic outputs
- **Optimistic Democracy** — Multi-validator consensus with appeal mechanism

## Quick Start

### Deploy the Contract

1. Install GenLayer CLI: `npm install -g genlayer`
2. Open [GenLayer Studio](https://studio.genlayer.com)
3. Import `contracts/genbets.py` via "Add From File"
4. Click Deploy

### Run the Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env
npm run dev
```

Open http://localhost:3000

## The Contract

The GenBets contract has 6 methods:

| Method | Type | Description |
|--------|------|-------------|
| `create_bet` | write | Create a bet with description, URL, criteria, opponent |
| `accept_bet` | write | Opponent accepts the bet |
| `cancel_bet` | write | Creator cancels an open bet |
| `resolve_bet` | write | AI fetches web data, evaluates, records winner |
| `get_bet` | view | Get details of a specific bet |
| `get_bet_count` | view | Get total number of bets |

## Tutorial Series

This project is the companion repo for the "From Zero to GenLayer" tutorial:

1. [Part 1: Why Smart Contracts Need AI](https://dev.to/fran6/from-zero-to-genlayer-why-smart-contracts-need-ai-part-13-hko) — GenLayer concepts and environment setup
2. [Part 2: Writing Your First Intelligent Contract](https://dev.to/fran6/from-zero-to-genlayer-writing-your-first-intelligent-contract-in-python-part-23-2bbo) — Building the GenBets contract step by step
3. [Part 3: Connecting Your dApp with Next.js and genlayer-js](https://dev.to/fran6/from-zero-to-genlayer-connecting-your-dapp-with-nextjs-and-genlayer-js-part-33-4fa8) — Frontend with genlayer-js

## Tech Stack

- **Contract:** Python (GenLayer Intelligent Contract)
- **Frontend:** Next.js 15, TypeScript, TanStack Query, Tailwind CSS
- **SDK:** genlayer-js
- **Wallet:** MetaMask

## Links

- [GenLayer Docs](https://docs.genlayer.com)
- [GenLayer Studio](https://studio.genlayer.com)
- [GenLayer Discord](https://discord.gg/8Jm4v89VAu)
- [genlayer-js SDK](https://github.com/genlayerlabs/genlayer-js)

## Built With

This project was built with [Claude Code](https://claude.ai/claude-code) as a development partner — from brainstorming and contract design to deployment and testing. Fitting for an AI-native blockchain project.

## License

MIT — see [LICENSE](LICENSE)
