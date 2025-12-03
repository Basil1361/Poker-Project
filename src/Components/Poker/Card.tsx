import React from 'react';
import type { Card as CardType } from '../../Logic/Poker/types';
import cardBack from '../../assets/card_back.jpg';

interface CardProps {
    card: CardType;
    faceUp?: boolean;
    height?: number;
}

export const Card: React.FC<CardProps> = ({ card, faceUp = true, height = 100 }) => {
    const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
    
    const getSuitSymbol = (suit: string) => {
        switch (suit) {
            case 'Hearts': return '♥';
            case 'Diamonds': return '♦';
            case 'Clubs': return '♣';
            case 'Spades': return '♠';
            default: return '';
        }
    };

    const width = height * 0.7;

    if (!faceUp) {
        return (
            <div style={{ 
                width, 
                height, 
                borderRadius: '8px', 
                overflow: 'hidden', 
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                border: '1px solid #ccc'
            }}>
                <img src={cardBack} alt="Card Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        );
    }

    return (
        <div style={{
            width,
            height,
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #ccc',
            position: 'relative',
            color: isRed ? 'red' : 'black',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            fontSize: `${height * 0.2}px`,
            fontWeight: 'bold'
        }}>
            <div style={{ position: 'absolute', top: '5px', left: '5px', lineHeight: 1, textAlign: 'center' }}>
                <div>{card.rank}</div>
                <div style={{ fontSize: '0.8em' }}>{getSuitSymbol(card.suit)}</div>
            </div>
            
            <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                fontSize: `${height * 0.4}px` 
            }}>
                {getSuitSymbol(card.suit)}
            </div>

            <div style={{ 
                position: 'absolute', 
                bottom: '5px', 
                right: '5px', 
                lineHeight: 1, 
                textAlign: 'center', 
                transform: 'rotate(180deg)' 
            }}>
                <div>{card.rank}</div>
                <div style={{ fontSize: '0.8em' }}>{getSuitSymbol(card.suit)}</div>
            </div>
        </div>
    );
};
