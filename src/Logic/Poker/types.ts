export type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    suit: Suit;
    rank: Rank;
}

export type HandRank = 
    | 'High Card'
    | 'Pair'
    | 'Two Pair'
    | 'Three of a Kind'
    | 'Straight'
    | 'Flush'
    | 'Full House'
    | 'Four of a Kind'
    | 'Straight Flush'
    | 'Royal Flush';

export interface Player {
    id: string;
    name: string;
    chips: number;
    hand: Card[];
    isFolded: boolean;
    currentBet: number; // Amount bet in the current round
    isAllIn: boolean;
}

export type GameStage = 'Pre-Flop' | 'Flop' | 'Turn' | 'River' | 'Showdown';

export interface GameAction {
    playerId: string;
    type: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
    amount: number;
    stage: GameStage;
    timestamp: number;
}

export interface GameLog {
    id: string;
    startTime: number;
    endTime?: number;
    players: { id: string, initialChips: number, hand: Card[] }[];
    communityCards: Card[];
    actions: GameAction[];
    winnerId?: string | string[]; // Split pot possible
    finalPot: number;
}
