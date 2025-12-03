import React from 'react';
import type { Player } from '../../Logic/Poker/types';
import { Card } from './Card';

interface PlayerAreaProps {
    player: Player;
    isActive: boolean;
    isDealer: boolean;
    showCards?: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ player, isActive, isDealer, showCards = true }) => {
    return (
        <div style={{
            padding: '20px',
            border: isActive ? '4px solid gold' : '2px solid #555',
            borderRadius: '15px',
            backgroundColor: isActive ? 'rgba(34, 34, 34, 0.95)' : 'rgba(34, 34, 34, 0.85)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '200px',
            position: 'relative',
            boxSizing: 'border-box',
            boxShadow: isActive ? '0 8px 25px rgba(255, 215, 0, 0.5)' : '0 4px 12px rgba(0,0,0,0.6)',
            transition: 'all 0.3s ease',
            transform: isActive ? 'scale(1.05)' : 'scale(1)'
        }}>
            {isDealer && (
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    backgroundColor: '#FFD700',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    border: '3px solid #FFA500',
                    fontSize: '1.2em',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}>D</div>
            )}
            <h3 style={{ margin: '5px 0', fontSize: '1.3em' }}>
                {player.name} 
                {player.isFolded && ' 🚫'} 
                {player.isAllIn && ' 💰'}
            </h3>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#4CAF50' }}>💵 ${player.chips}</div>
            <div style={{ fontSize: '0.95em', color: '#FFA726' }}>Bet: ${player.currentBet}</div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center', width: '100%' }}>
                {player.hand.map((card, index) => (
                    <Card key={index} card={card} faceUp={showCards && !player.isFolded} />
                ))}
                {player.hand.length === 0 && <div style={{ height: 100, width: 140 }}></div>}
            </div>
        </div>
    );
};
