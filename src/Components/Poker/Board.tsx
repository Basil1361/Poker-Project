import React from 'react';
import type { Card as CardType } from '../../Logic/Poker/types';
import { Card } from './Card';

interface BoardProps {
    communityCards: CardType[];
    pot: number;
    currentBet: number;
    stage: string;
}

export const Board: React.FC<BoardProps> = ({ communityCards, pot, currentBet, stage }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '20px',
            padding: '20px',
            backgroundColor: '#2c3e50',
            borderRadius: '20px',
            border: '5px solid #34495e',
            width: '60%'
        }}>
            <div style={{ color: 'white', marginBottom: '10px', fontSize: '1.2em' }}>
                Pot: ${pot} | Current Bet: ${currentBet} | Stage: {stage}
            </div>
            <div style={{ display: 'flex', gap: '10px', minHeight: '110px' }}>
                {communityCards.map((card, index) => (
                    <Card key={index} card={card} />
                ))}
                {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                    <div key={`placeholder-${i}`} style={{
                        width: 70,
                        height: 100,
                        border: '1px dashed #7f8c8d',
                        borderRadius: '8px'
                    }}></div>
                ))}
            </div>
        </div>
    );
};
