import type { GameLog, GameAction, Player, Card } from './types';

export class GameLogger {
    private currentLog: GameLog | null = null;
    private logs: GameLog[] = [];

    startNewGame(gameId: string, players: Player[]) {
        this.currentLog = {
            id: gameId,
            startTime: Date.now(),
            players: players.map(p => ({ id: p.id, initialChips: p.chips, hand: [] })), // Hands added later or now if known
            communityCards: [],
            actions: [],
            finalPot: 0
        };
    }

    logHand(playerId: string, hand: Card[]) {
        if (this.currentLog) {
            const p = this.currentLog.players.find(pl => pl.id === playerId);
            if (p) p.hand = [...hand];
        }
    }

    logCommunityCards(cards: Card[]) {
        if (this.currentLog) {
            this.currentLog.communityCards = [...cards];
        }
    }

    logAction(action: GameAction) {
        if (this.currentLog) {
            this.currentLog.actions.push(action);
        }
    }

    endGame(winnerId: string | string[], finalPot: number) {
        if (this.currentLog) {
            this.currentLog.endTime = Date.now();
            this.currentLog.winnerId = winnerId;
            this.currentLog.finalPot = finalPot;
            this.logs.push(this.currentLog);
            
            // For now, just log to console. In a real app, this would send to a backend or save to local storage.
            console.log("Game Logged for ML:", JSON.stringify(this.currentLog, null, 2));
            
            // Save to localStorage for persistence
            const savedLogs = JSON.parse(localStorage.getItem('poker_ml_data') || '[]');
            savedLogs.push(this.currentLog);
            localStorage.setItem('poker_ml_data', JSON.stringify(savedLogs));
            
            this.currentLog = null;
        }
    }

    getAllLogs() {
        return this.logs;
    }
}

export const gameLogger = new GameLogger();
