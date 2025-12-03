import type { Card, HandRank, Rank } from './types';

const RANK_VALUES: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export interface HandResult {
    rank: HandRank;
    rankValue: number;
    tieBreakers: number[]; // Values of cards to break ties
    description: string;
}

export class HandEvaluator {
    static evaluate(cards: Card[]): HandResult {
        if (cards.length < 5) {
            // Should not happen in a full showdown, but handle gracefully
            return { rank: 'High Card', rankValue: 1, tieBreakers: [], description: 'Not enough cards' };
        }

        // We need to find the best 5-card combination out of the available cards (usually 7)
        // For simplicity in this implementation, we will check all combinations if > 5, 
        // or just evaluate the 5 if exactly 5.
        // Actually, generating all combinations of 5 from 7 is C(7,5) = 21, which is small.
        
        const combinations = this.getCombinations(cards, 5);
        let bestHand: HandResult | null = null;

        for (const combo of combinations) {
            const result = this.evaluateFiveCards(combo);
            if (!bestHand || this.compareHands(result, bestHand) > 0) {
                bestHand = result;
            }
        }

        return bestHand!;
    }

    private static getCombinations(cards: Card[], k: number): Card[][] {
        const result: Card[][] = [];
        function backtrack(start: number, current: Card[]) {
            if (current.length === k) {
                result.push([...current]);
                return;
            }
            for (let i = start; i < cards.length; i++) {
                current.push(cards[i]);
                backtrack(i + 1, current);
                current.pop();
            }
        }
        backtrack(0, []);
        return result;
    }

    private static compareHands(a: HandResult, b: HandResult): number {
        if (a.rankValue !== b.rankValue) {
            return a.rankValue - b.rankValue;
        }
        for (let i = 0; i < a.tieBreakers.length; i++) {
            if (a.tieBreakers[i] !== b.tieBreakers[i]) {
                return a.tieBreakers[i] - b.tieBreakers[i];
            }
        }
        return 0;
    }

    private static evaluateFiveCards(cards: Card[]): HandResult {
        // Sort by rank descending
        const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
        const ranks = sortedCards.map(c => RANK_VALUES[c.rank]);
        const suits = sortedCards.map(c => c.suit);

        const isFlush = suits.every(s => s === suits[0]);
        const isStraight = this.checkStraight(ranks);
        
        // Count frequencies
        const counts: Record<number, number> = {};
        for (const r of ranks) {
            counts[r] = (counts[r] || 0) + 1;
        }
        const countValues = Object.values(counts);
        const uniqueRanks = Object.keys(counts).map(Number).sort((a, b) => b - a); // Descending

        // Check Royal Flush
        if (isFlush && isStraight && ranks[0] === 14) {
            return { rank: 'Royal Flush', rankValue: 10, tieBreakers: [], description: 'Royal Flush' };
        }

        // Check Straight Flush
        if (isFlush && isStraight) {
            return { rank: 'Straight Flush', rankValue: 9, tieBreakers: [ranks[0]], description: 'Straight Flush' };
        }

        // Check Four of a Kind
        if (countValues.includes(4)) {
            const quadRank = Number(Object.keys(counts).find(key => counts[Number(key)] === 4));
            const kicker = Number(Object.keys(counts).find(key => counts[Number(key)] === 1));
            return { rank: 'Four of a Kind', rankValue: 8, tieBreakers: [quadRank, kicker], description: 'Four of a Kind' };
        }

        // Check Full House
        if (countValues.includes(3) && countValues.includes(2)) {
            const tripRank = Number(Object.keys(counts).find(key => counts[Number(key)] === 3));
            const pairRank = Number(Object.keys(counts).find(key => counts[Number(key)] === 2));
            return { rank: 'Full House', rankValue: 7, tieBreakers: [tripRank, pairRank], description: 'Full House' };
        }

        // Check Flush
        if (isFlush) {
            return { rank: 'Flush', rankValue: 6, tieBreakers: ranks, description: 'Flush' };
        }

        // Check Straight
        if (isStraight) {
            return { rank: 'Straight', rankValue: 5, tieBreakers: [ranks[0]], description: 'Straight' };
        }

        // Check Three of a Kind
        if (countValues.includes(3)) {
            const tripRank = Number(Object.keys(counts).find(key => counts[Number(key)] === 3));
            const kickers = uniqueRanks.filter(r => r !== tripRank);
            return { rank: 'Three of a Kind', rankValue: 4, tieBreakers: [tripRank, ...kickers], description: 'Three of a Kind' };
        }

        // Check Two Pair
        if (countValues.filter(c => c === 2).length === 2) {
            const pairs = uniqueRanks.filter(r => counts[r] === 2); // Already sorted desc
            const kicker = uniqueRanks.find(r => counts[r] === 1)!;
            return { rank: 'Two Pair', rankValue: 3, tieBreakers: [...pairs, kicker], description: 'Two Pair' };
        }

        // Check Pair
        if (countValues.includes(2)) {
            const pairRank = Number(Object.keys(counts).find(key => counts[Number(key)] === 2));
            const kickers = uniqueRanks.filter(r => r !== pairRank);
            return { rank: 'Pair', rankValue: 2, tieBreakers: [pairRank, ...kickers], description: 'Pair' };
        }

        // High Card
        return { rank: 'High Card', rankValue: 1, tieBreakers: ranks, description: 'High Card' };
    }

    private static checkStraight(ranks: number[]): boolean {
        // Handle Ace low straight (A, 5, 4, 3, 2) -> ranks would be [14, 5, 4, 3, 2]
        if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
            return true;
        }
        for (let i = 0; i < ranks.length - 1; i++) {
            if (ranks[i] - ranks[i+1] !== 1) {
                return false;
            }
        }
        return true;
    }
}
