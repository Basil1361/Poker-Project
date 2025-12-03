import React, { useState } from 'react';

interface ControlsProps {
    onAction: (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => void;
    canCheck: boolean;
    callAmount: number;
    minRaise: number;
    maxRaise: number;
    isActive: boolean;
    orientation?: 'horizontal' | 'vertical';
}

export const Controls: React.FC<ControlsProps> = ({ onAction, canCheck, callAmount, minRaise, maxRaise, isActive, orientation = 'horizontal' }) => {
    const [raiseAmount, setRaiseAmount] = useState(minRaise);

    if (!isActive) return null;

    const isVertical = orientation === 'vertical';

    const handleQuickBet = (multiplier: number) => {
        // Base the multiplier on the current bet or big blind if 0
        const base = callAmount > 0 ? callAmount : 20; // Assuming 20 is BB
        let amount = base * multiplier;
        
        // Ensure within bounds
        if (amount < minRaise) amount = minRaise;
        if (amount > maxRaise) amount = maxRaise;
        
        setRaiseAmount(amount);
    };

    const handleAllIn = () => setRaiseAmount(maxRaise);
    const handleReset = () => setRaiseAmount(minRaise);

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: isVertical ? 'column' : 'row',
            gap: '15px', 
            padding: '20px', 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '12px',
            width: isVertical ? '220px' : 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
            <button onClick={() => onAction('fold')} style={btnStyle('#ff4444', isVertical)}>Fold</button>
            
            {canCheck ? (
                <button onClick={() => onAction('check')} style={btnStyle('#4444ff', isVertical)}>Check</button>
            ) : (
                <button onClick={() => onAction('call')} style={btnStyle('#4444ff', isVertical)}>Call ${callAmount}</button>
            )}

            <div style={{ height: '1px', backgroundColor: '#ccc', margin: '5px 0' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'black', fontWeight: 'bold' }}>Amount:</span>
                    <input 
                        type="number" 
                        value={raiseAmount} 
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                        style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <input 
                    type="range" 
                    min={minRaise} 
                    max={maxRaise} 
                    value={raiseAmount} 
                    onChange={(e) => setRaiseAmount(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'space-between' }}>
                    <button onClick={() => handleQuickBet(3)} style={smallBtnStyle}>3x</button>
                    <button onClick={() => handleQuickBet(4)} style={smallBtnStyle}>4x</button>
                    <button onClick={() => handleQuickBet(5)} style={smallBtnStyle}>5x</button>
                    <button onClick={handleAllIn} style={{ ...smallBtnStyle, backgroundColor: '#ff8800', color: 'white' }}>All-In</button>
                    <button onClick={handleReset} style={{ ...smallBtnStyle, backgroundColor: '#666', color: 'white', width: '100%' }}>Reset Pot Size</button>
                </div>

                <button onClick={() => onAction('raise', raiseAmount)} style={btnStyle('#44ff44', isVertical)}>
                    Raise to ${raiseAmount}
                </button>
            </div>
        </div>
    );
};

const smallBtnStyle = {
    padding: '5px 10px',
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: '1 0 30%',
    fontSize: '0.9em',
    color: 'black'
};

const btnStyle = (color: string, isVertical: boolean) => ({
    padding: '15px 20px',
    backgroundColor: color,
    color: color === '#44ff44' ? 'black' : 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold' as 'bold',
    width: isVertical ? '100%' : 'auto',
    fontSize: '1.1em',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
});
