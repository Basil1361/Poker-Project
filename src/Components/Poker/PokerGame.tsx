import React from 'react';
import { usePokerGame } from '../../Logic/Poker/usePokerGame';
import { PlayerArea } from './PlayerArea';
import { Board } from './Board';
import { Controls } from './Controls';
import { HandRankings } from './HandRankings';

// Assets
import tableBg from '../../assets/file_000000001324623087144d93e4e7dc6e.png';
import flush from '../../assets/ranks/FLUSH.jpg';
import fourOfAKind from '../../assets/ranks/FOUR OF A KIND.jpg';
import fullHouse from '../../assets/ranks/FULL HOUSE.jpg';
import highCard from '../../assets/ranks/HIGH CARD.jpg';
import pair from '../../assets/ranks/PAIR.jpg';
import royalFlush from '../../assets/ranks/ROYAL FLUSH.jpg';
import straightFlush from '../../assets/ranks/STRAIGHT FLUSH.jpg';
import straight from '../../assets/ranks/STRAIGHT.jpg';
import threeOfAKind from '../../assets/ranks/THREE OF A KIND.jpg';
import twoPair from '../../assets/ranks/TWO PAIR.jpg';

const RANK_IMAGES: Record<string, string> = {
    'Royal Flush': royalFlush,
    'Straight Flush': straightFlush,
    'Four of a Kind': fourOfAKind,
    'Full House': fullHouse,
    'Flush': flush,
    'Straight': straight,
    'Three of a Kind': threeOfAKind,
    'Two Pair': twoPair,
    'Pair': pair,
    'High Card': highCard,
};

export const PokerGame: React.FC = () => {
    const {
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
    } = usePokerGame();

    const [isWinnerModalMinimized, setIsWinnerModalMinimized] = React.useState(false);
    const [showOpponentCards, setShowOpponentCards] = React.useState(false);
    const [showTurnIndicator, setShowTurnIndicator] = React.useState(true);

    React.useEffect(() => {
        if (winnerMessage) {
            setIsWinnerModalMinimized(false);
        }
    }, [winnerMessage]);

    React.useEffect(() => {
        if (gameActive) {
            setShowTurnIndicator(true);
            const timer = setTimeout(() => {
                setShowTurnIndicator(false);
            }, 2000); // Hide after 2 seconds
            
            return () => clearTimeout(timer);
        }
    }, [currentTurnIndex, gameActive]);

    const currentPlayer = players[currentTurnIndex];
    const canCheck = currentPlayer.currentBet === currentBet;
    const callAmount = currentBet - currentPlayer.currentBet;
    const minRaise = currentBet + 20; // Simplified min raise
    const maxRaise = currentPlayer.chips + currentPlayer.currentBet;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100vw',
            backgroundImage: `url(${tableBg})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'black',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <style>
                {`
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: scale(0.8); }
                        20% { opacity: 1; transform: scale(1); }
                        80% { opacity: 1; transform: scale(1); }
                        100% { opacity: 0; transform: scale(0.8); }
                    }
                `}
            </style>
            
            {/* Turn Indicator - Bottom Left */}
            {gameActive && showTurnIndicator && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#FFD700',
                    padding: '20px 40px',
                    borderRadius: '15px',
                    fontSize: '1.8em',
                    fontWeight: 'bold',
                    zIndex: 150,
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
                    border: '3px solid #FFD700',
                    animation: 'fadeInOut 2s ease-in-out forwards',
                    pointerEvents: 'none'
                }}>
                    {currentTurnIndex === 0 ? '🎲 Your Turn' : '🎲 Player 2\'s Turn'}
                </div>
            )}
            
            {/* Hand Rankings - Bottom Left Below Turn Indicator */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 100 }}>
                <HandRankings />
            </div>
            
            <h1 style={{
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                fontSize: '3em',
                margin: '20px 0',
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>♠️ Texas Poker No Limit ♥️</h1>
            
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 100 }}>
                <button 
                    onClick={() => setShowOpponentCards(!showOpponentCards)} 
                    style={{ 
                        padding: '12px 18px', 
                        cursor: 'pointer', 
                        backgroundColor: showOpponentCards ? '#ff8800' : '#444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {showOpponentCards ? '🙈 Hide Cards' : '👁️ Reveal Cards'}
                </button>
                <button 
                    onClick={resetChips} 
                    style={{ 
                        padding: '12px 18px', 
                        cursor: 'pointer', 
                        backgroundColor: '#d32f2f', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🔄 Reset Game
                </button>
            </div>

            {winnerMessage && !isWinnerModalMinimized && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    padding: '40px',
                    borderRadius: '20px',
                    zIndex: 2000,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => setIsWinnerModalMinimized(true)}
                            style={{ background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer', borderRadius: '5px' }}
                        >
                            _ Minimize
                        </button>
                    </div>
                    <h2>{winnerMessage}</h2>
                    {winningRank && RANK_IMAGES[winningRank] && (
                        <img src={RANK_IMAGES[winningRank]} alt={winningRank} style={{ maxWidth: '300px', borderRadius: '10px' }} />
                    )}
                    <button onClick={startNewGame} style={{ padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer' }}>
                        Next Hand
                    </button>
                </div>
            )}

            {winnerMessage && isWinnerModalMinimized && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    padding: '10px',
                    borderRadius: '10px',
                    zIndex: 2000,
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    <span>Game Over</span>
                    <button onClick={() => setIsWinnerModalMinimized(false)} style={{ cursor: 'pointer' }}>Show Results</button>
                    <button onClick={startNewGame} style={{ cursor: 'pointer' }}>Next Hand</button>
                </div>
            )}

            {!gameActive && !winnerMessage && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000
                }}>
                    <button 
                        onClick={startNewGame} 
                        style={{ 
                            padding: '50px 100px', 
                            fontSize: '3em', 
                            cursor: 'pointer',
                            backgroundColor: '#44ff44',
                            color: 'black',
                            border: 'none',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.15)';
                            e.currentTarget.style.boxShadow = '0 15px 50px rgba(68,255,68,0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
                        }}
                    >
                        🎴 Start Game 🎴
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', padding: '20px' }}>
                {/* Player 2 (Top) */}
                <PlayerArea 
                    player={players[1]} 
                    isActive={currentTurnIndex === 1 && gameActive} 
                    isDealer={dealerIndex === 1} 
                    showCards={showOpponentCards} 
                />
            </div>

            <Board 
                communityCards={communityCards} 
                pot={pot} 
                currentBet={currentBet} 
                stage={stage} 
            />

            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', padding: '20px' }}>
                {/* Player 1 (Bottom) */}
                <PlayerArea 
                    player={players[0]} 
                    isActive={currentTurnIndex === 0 && gameActive} 
                    isDealer={dealerIndex === 0} 
                    showCards={true}
                />
            </div>

            <div style={{ position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
                <Controls 
                    onAction={handleAction}
                    canCheck={canCheck}
                    callAmount={callAmount}
                    minRaise={minRaise}
                    maxRaise={maxRaise}
                    isActive={gameActive}
                    orientation="vertical"
                />
            </div>
        </div>
    );
};
