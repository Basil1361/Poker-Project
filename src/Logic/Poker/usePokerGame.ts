import { useState, useCallback } from 'react';
import { Deck } from './Deck';
import type { Card, Player, GameStage, GameAction } from './types';
import { HandEvaluator } from './HandEvaluator';
import { gameLogger } from './GameLogger';

const INITIAL_CHIPS = 1000;
const SMALL_BLIND = 10;
const BIG_BLIND = 20;

export const usePokerGame = () => {
    const [deck] = useState(new Deck());
    const [players, setPlayers] = useState<Player[]>([
        { id: 'p1', name: 'Player 1', chips: INITIAL_CHIPS, hand: [], isFolded: false, currentBet: 0, isAllIn: false },
        { id: 'p2', name: 'Player 2', chips: INITIAL_CHIPS, hand: [], isFolded: false, currentBet: 0, isAllIn: false }
    ]);
    const [communityCards, setCommunityCards] = useState<Card[]>([]);
    const [pot, setPot] = useState(0);
    const [stage, setStage] = useState<GameStage>('Pre-Flop');
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [dealerIndex, setDealerIndex] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [winnerMessage, setWinnerMessage] = useState('');
    const [winningRank, setWinningRank] = useState<string | null>(null);
    const [gameActive, setGameActive] = useState(false);
    const [hasActed, setHasActed] = useState<Record<string, boolean>>({});

    // Helper to get next player index
    const getNextPlayerIndex = (currentIndex: number) => {
        return (currentIndex + 1) % players.length;
    };

    const startNewGame = useCallback(() => {
        deck.reset();
        const newPlayers = players.map(p => ({
            ...p,
            hand: [deck.deal()!, deck.deal()!],
            isFolded: false,
            currentBet: 0,
            isAllIn: false
        }));

        // Blinds
        // In Heads Up: Dealer is SB, Non-Dealer is BB.
        const sbIndex = dealerIndex;
        const bbIndex = getNextPlayerIndex(sbIndex);

        // Deduct blinds
        let sbAmount = Math.min(SMALL_BLIND, newPlayers[sbIndex].chips);
        let bbAmount = Math.min(BIG_BLIND, newPlayers[bbIndex].chips);

        newPlayers[sbIndex].chips -= sbAmount;
        newPlayers[sbIndex].currentBet = sbAmount;
        
        newPlayers[bbIndex].chips -= bbAmount;
        newPlayers[bbIndex].currentBet = bbAmount;

        setPlayers(newPlayers);
        setCommunityCards([]);
        setPot(sbAmount + bbAmount);
        setStage('Pre-Flop');
        setCurrentBet(BIG_BLIND);
        setCurrentTurnIndex(sbIndex); // SB acts first pre-flop in heads up? No, BB acts last. Dealer (SB) acts first pre-flop.
        setWinnerMessage('');
        setWinningRank(null);
        setGameActive(true);
        setHasActed({});

        gameLogger.startNewGame(`game-${Date.now()}`, newPlayers);
        newPlayers.forEach(p => gameLogger.logHand(p.id, p.hand));
    }, [deck, dealerIndex]);

    const resetChips = useCallback(() => {
        deck.reset();
        const initialPlayers: Player[] = [
            { id: 'p1', name: 'Player 1', chips: INITIAL_CHIPS, hand: [], isFolded: false, currentBet: 0, isAllIn: false },
            { id: 'p2', name: 'Player 2', chips: INITIAL_CHIPS, hand: [], isFolded: false, currentBet: 0, isAllIn: false }
        ];

        setPlayers(initialPlayers);
        setCommunityCards([]);
        setPot(0);
        setStage('Pre-Flop');
        setCurrentBet(0);
        setCurrentTurnIndex(0);
        setWinnerMessage('');
        setWinningRank(null);
        setGameActive(false);
        setHasActed({});
    }, [deck]);

    const handleAction = (actionType: 'fold' | 'check' | 'call' | 'raise', amount: number = 0) => {
        if (!gameActive) return;

        const newPlayers = [...players];
        const player = newPlayers[currentTurnIndex];

        const action: GameAction = {
            playerId: player.id,
            type: actionType as any,
            amount: 0,
            stage,
            timestamp: Date.now()
        };

        if (actionType === 'fold') {
            player.isFolded = true;
            setPlayers(newPlayers);
            gameLogger.logAction(action);
            endHand(newPlayers); // If one folds, other wins
            return;
        }

        if (actionType === 'call') {
            const callAmount = currentBet - player.currentBet;
            const actualAmount = Math.min(callAmount, player.chips);
            player.chips -= actualAmount;
            player.currentBet += actualAmount;
            setPot(prev => prev + actualAmount);
            action.amount = actualAmount;
        }

        if (actionType === 'check') {
            // Can only check if currentBet == player.currentBet
            if (player.currentBet !== currentBet) {
                // Treat as call if they try to check when they need to call? Or block UI.
                // For now assume UI handles validity, or we treat as invalid.
                // But let's just return if invalid.
                // Actually, let's just allow it and assume it's a call of 0.
            }
        }

        if (actionType === 'raise') {
            const raiseAmount = amount; // Total bet amount they want to be at
            const addedChips = raiseAmount - player.currentBet;
            if (addedChips > player.chips) {
                // All in logic could go here
                return; 
            }
            player.chips -= addedChips;
            player.currentBet = raiseAmount;
            setPot(prev => prev + addedChips);
            setCurrentBet(raiseAmount);
            action.amount = addedChips;
        }

        gameLogger.logAction(action);
        setPlayers(newPlayers);

        // Mark current player as having acted
        const newHasActed = { ...hasActed, [player.id]: true };
        setHasActed(newHasActed);

        // Check if round is over
        // Round is over if all active players have acted and bets are equal
        
        const nextIndex = getNextPlayerIndex(currentTurnIndex);
        const nextPlayer = newPlayers[nextIndex];

        if (nextPlayer.isFolded || nextPlayer.isAllIn) {
             // If everyone else is folded or all in, proceed.
             // But here we only have 2 players.
             proceedToNextStage(newPlayers);
             return;
        }

        // If bets are equal and the next player has also acted, proceed.
        // Exception: Pre-flop, if SB calls BB, bets are equal, but BB hasn't acted (checked) yet.
        // But with hasActed logic:
        // SB calls. hasActed[SB] = true. hasActed[BB] = false (initially).
        // Bets equal. hasActed[BB] is false. Don't proceed. Move to BB.
        // BB checks. hasActed[BB] = true.
        // Bets equal. hasActed[SB] is true. Proceed.
        
        // What if SB raises?
        // SB raises. hasActed[SB] = true. Bets not equal. Move to BB.
        // BB calls. hasActed[BB] = true. Bets equal. hasActed[SB] is true. Proceed.
        
        // What if SB raises, BB reraises?
        // SB raises. hasActed[SB] = true. Move to BB.
        // BB reraises. hasActed[BB] = true. Bets not equal. Move to SB.
        // SB calls. hasActed[SB] = true. Bets equal. hasActed[BB] is true. Proceed.
        
        // Wait, if BB reraises, SB needs to act again.
        // But hasActed[SB] is already true from the first raise.
        // So if SB calls, bets equal, hasActed[BB] is true. Proceed.
        // This is correct. SB's call closes the action.

        if (player.currentBet === nextPlayer.currentBet && newHasActed[nextPlayer.id]) {
            proceedToNextStage(newPlayers);
        } else {
            setCurrentTurnIndex(nextIndex);
        }
    };

    const proceedToNextStage = (currentPlayers: Player[]) => {
        // Reset current bets for the new round
        const playersReset = currentPlayers.map(p => ({ ...p, currentBet: 0 }));
        setPlayers(playersReset);
        setCurrentBet(0);
        setHasActed({});
        
        // Post-flop: Non-Dealer (BB) acts first.
        // In Heads Up, Dealer is SB. Non-Dealer is BB.
        // BB index is getNextPlayerIndex(dealerIndex).
        setCurrentTurnIndex(getNextPlayerIndex(dealerIndex)); 

        if (stage === 'Pre-Flop') {
            setStage('Flop');
            setCommunityCards([deck.deal()!, deck.deal()!, deck.deal()!]);
        } else if (stage === 'Flop') {
            setStage('Turn');
            setCommunityCards(prev => [...prev, deck.deal()!]);
        } else if (stage === 'Turn') {
            setStage('River');
            setCommunityCards(prev => [...prev, deck.deal()!]);
        } else if (stage === 'River') {
            setStage('Showdown');
            determineWinner(currentPlayers);
        }
        
        gameLogger.logCommunityCards(communityCards); // Log updates
    };

    const determineWinner = (currentPlayers: Player[]) => {
        const activePlayers = currentPlayers.filter(p => !p.isFolded);
        if (activePlayers.length === 1) {
            endHand(currentPlayers, activePlayers[0]);
            return;
        }

        const p1 = activePlayers[0];
        const p2 = activePlayers[1];
        
        const r1 = HandEvaluator.evaluate([...p1.hand, ...communityCards]);
        const r2 = HandEvaluator.evaluate([...p2.hand, ...communityCards]);
        let winner = p1;
        let winningHand = r1;
        if (r1.rankValue < r2.rankValue) {
            winner = p2;
            winningHand = r2;
        } else if (r1.rankValue === r2.rankValue) {
            // Check tie breakers
            for (let i = 0; i < Math.max(r1.tieBreakers.length, r2.tieBreakers.length); i++) {
                const t1 = r1.tieBreakers[i] || 0;
                const t2 = r2.tieBreakers[i] || 0;
                if (t1 < t2) {
                    winner = p2;
                    winningHand = r2;
                    break;
                } else if (t1 > t2) {
                    winner = p1;
                    winningHand = r1;
                    break;
                }
            }
        }

        endHand(currentPlayers, winner, r1.rankValue === r2.rankValue && JSON.stringify(r1.tieBreakers) === JSON.stringify(r2.tieBreakers) ? 'Split' : winner.name, winningHand.rank);
    };

    const endHand = (currentPlayers: Player[], winner?: Player, reason?: string, rank?: string) => {
        let winningPlayer = winner;
        if (!winningPlayer) {
            // Find the one not folded
            winningPlayer = currentPlayers.find(p => !p.isFolded);
        }

        if (winningPlayer) {
            setWinnerMessage(`${winningPlayer.name} wins ${pot} chips! ${reason ? `(${reason})` : ''}`);
            if (rank) setWinningRank(rank);
            const updatedPlayers = currentPlayers.map(p => {
                if (p.id === winningPlayer!.id) {
                    return { ...p, chips: p.chips + pot };
                }
                return p;
            });
            setPlayers(updatedPlayers);
            gameLogger.endGame(winningPlayer.id, pot);
        } else {
             // Split pot logic would go here
             setWinnerMessage("Split Pot!");
             const half = Math.floor(pot / 2);
             const updatedPlayers = currentPlayers.map(p => ({ ...p, chips: p.chips + half }));
             setPlayers(updatedPlayers);
             gameLogger.endGame(['p1', 'p2'], pot);
        }
        
        setGameActive(false);
        setDealerIndex(prev => (prev + 1) % players.length);
    };

    return {
        players,
        communityCards,
        pot,
        stage,
        currentTurnIndex,
        currentBet,
        winnerMessage,
        winningRank,
        gameActive,
        dealerIndex,
        startNewGame,
        handleAction,
        resetChips
    };
};
