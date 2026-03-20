# { "Depends": "py-genlayer:test" }

import json
from dataclasses import dataclass
from genlayer import *


@allow_storage
@dataclass
class Bet:
    creator: str
    opponent: str
    description: str
    resolution_url: str
    resolution_prompt: str
    status: str
    winner: str


class GenBets(gl.Contract):
    bet_counter: u256
    bets: TreeMap[u256, Bet]

    def __init__(self):
        self.bet_counter = u256(0)

    @gl.public.write
    def create_bet(self, description: str, resolution_url: str, resolution_prompt: str, opponent: str) -> u256:
        bet_id = self.bet_counter
        self.bets[bet_id] = Bet(creator=str(gl.message.sender_address), opponent=opponent, description=description, resolution_url=resolution_url, resolution_prompt=resolution_prompt, status="open", winner="")
        self.bet_counter = bet_id + u256(1)
        return bet_id

    @gl.public.write
    def accept_bet(self, bet_id: u256) -> None:
        bet = self.bets[bet_id]
        if bet.status != "open":
            raise Exception("Bet is not open")
        if str(gl.message.sender_address) == bet.creator:
            raise Exception("Cannot accept your own bet")
        if str(gl.message.sender_address) != bet.opponent:
            raise Exception("Only the invited opponent can accept")
        bet.status = "accepted"
        self.bets[bet_id] = bet

    @gl.public.write
    def cancel_bet(self, bet_id: u256) -> None:
        bet = self.bets[bet_id]
        if bet.status != "open":
            raise Exception("Can only cancel open bets")
        if str(gl.message.sender_address) != bet.creator:
            raise Exception("Only creator can cancel")
        bet.status = "cancelled"
        self.bets[bet_id] = bet

    @gl.public.write
    def resolve_bet(self, bet_id: u256) -> str:
        bet = self.bets[bet_id]
        if bet.status != "accepted":
            raise Exception("Bet must be in accepted status")

        def nondet() -> str:
            web_data = gl.nondet.web.render(bet.resolution_url, mode="text")

            task = f"""You are an impartial judge evaluating a bet.

Bet description: {bet.description}

Resolution criteria: {bet.resolution_prompt}

Web page content:
{web_data[:3000]}
End of web page data.

Based on the data above, determine who wins this bet.
You must respond with exactly one word: either "creator" or "opponent".
Nothing else. Just one word.
"""
            result = gl.nondet.exec_prompt(task).strip().lower()
            if "creator" in result:
                return "creator"
            return "opponent"

        winner = gl.eq_principle.strict_eq(nondet)

        bet.winner = winner
        bet.status = "resolved"
        self.bets[bet_id] = bet
        return winner

    @gl.public.view
    def get_bet(self, bet_id: u256) -> dict:
        bet = self.bets[bet_id]
        return {"id": int(bet_id), "creator": bet.creator, "opponent": bet.opponent, "description": bet.description, "resolution_url": bet.resolution_url, "resolution_prompt": bet.resolution_prompt, "status": bet.status, "winner": bet.winner}

    @gl.public.view
    def get_bet_count(self) -> u256:
        return self.bet_counter
