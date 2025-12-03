import React, { useState } from 'react';

const rankings = [
    'Royal Flush',
    'Straight Flush',
    'Four of a Kind',
    'Full House',
    'Flush',
    'Straight',
    'Three of a Kind',
    'Two Pair',
    'Pair',
    'High Card'
];

export const HandRankings: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'fixed', right: 0, top: 0, zIndex: 1000 }}>
            <button onClick={() => setIsOpen(!isOpen)} style={{ margin: '10px', padding: '10px', cursor: 'pointer' }}>
                {isOpen ? 'Close Help' : 'Hand Rankings'}
            </button>
            {isOpen && (
                <div style={{
                    height: 'auto',
                    maxHeight: '80vh',
                    width: '200px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    color: 'white',
                    padding: '20px',
                    boxShadow: '-2px 0 5px rgba(0,0,0,0.5)',
                    borderRadius: '0 0 0 10px'
                }}>
                    <h3 style={{ marginTop: 0 }}>Hand Rankings</h3>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {rankings.map((r, i) => (
                            <li key={i} style={{ marginBottom: '10px', fontSize: '0.9em' }}>
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
