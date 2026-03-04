'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Timer, CheckCircle, RotateCcw } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  user-select: none; /* Prevent text selection while dragging */
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--gray-100);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
`;

const TimerBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
`;

const Grid = styled.div<{ $size: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$size}, 1fr);
  gap: 2px;
  background: var(--gray-100);
  padding: 4px;
  border-radius: 8px;
  touch-action: none; /* Prevent scrolling on touch devices while playing */
`;

const Cell = styled.div<{ $selected: boolean; $found: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$found ? '#d1f4e0' : (props.$selected ? '#fce8b2' : 'white')};
  color: ${props => props.$found ? '#12A152' : (props.$selected ? '#e67c73' : '#3c4043')};
  font-weight: ${props => (props.$found || props.$selected) ? 800 : 600};
  font-size: 1.1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;

  @media (max-width: 600px) {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }
`;

const WordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const WordBagLabel = styled.div<{ $found: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => props.$found ? '#12A152' : 'white'};
  color: ${props => props.$found ? 'white' : '#5f6368'};
  border: 1px solid ${props => props.$found ? '#12A152' : 'var(--gray-100)'};
  text-decoration: ${props => props.$found ? 'line-through' : 'none'};
  transition: all 0.2s;
`;

const ResultCard = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #12A152;
  box-shadow: 0 4px 12px rgba(18, 161, 82, 0.1);
  animation: popIn 0.3s ease-out;

  @keyframes popIn {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// --- GRID GENERATION LOGIC ---
const DIRECTIONS = [
    [0, 1],  // Right
    [1, 0],  // Down
    [1, 1],  // Diagonal Down-Right
    [-1, 1]  // Diagonal Up-Right
];

interface CellData {
    letter: string;
    row: number;
    col: number;
}

interface WordSearchProps {
    words: string[];
    onComplete: (timeInSeconds: number) => void;
}

export default function WordSearch({ words: originalWords, onComplete }: WordSearchProps) {
    const GRID_SIZE = Math.max(12, ...originalWords.map(w => w.length + 2));
    const [grid, setGrid] = useState<CellData[][]>([]);
    const [words, setWords] = useState<string[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [foundCells, setFoundCells] = useState<Set<string>>(new Set());

    // Interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [selectionPath, setSelectionPath] = useState<{ row: number, col: number }[]>([]);

    // Timer state
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Initialize Game
    const initGame = useCallback(() => {
        // Clean up words (uppercase, remove spaces/special chars)
        const cleanWords = originalWords
            .map(w => w.toUpperCase().replace(/[^A-ZÑ]/g, ''))
            .filter(w => w.length > 2);

        setWords(cleanWords);
        setFoundWords([]);
        setFoundCells(new Set());
        setSelectionPath([]);
        setTimeElapsed(0);
        setIsFinished(false);
        setIsPlaying(true);

        // 1. Create empty grid
        const newGrid: CellData[][] = Array(GRID_SIZE).fill(null).map((_, r) =>
            Array(GRID_SIZE).fill(null).map((_, c) => ({ letter: '', row: r, col: c }))
        );

        // 2. Place words
        const placeWord = (word: string) => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
                const startRow = Math.floor(Math.random() * GRID_SIZE);
                const startCol = Math.floor(Math.random() * GRID_SIZE);

                // Check bounds
                const endRow = startRow + dir[0] * (word.length - 1);
                const endCol = startCol + dir[1] * (word.length - 1);

                if (endRow >= 0 && endRow < GRID_SIZE && endCol >= 0 && endCol < GRID_SIZE) {
                    // Check overlaps
                    let canPlace = true;
                    for (let i = 0; i < word.length; i++) {
                        const r = startRow + dir[0] * i;
                        const c = startCol + dir[1] * i;
                        if (newGrid[r][c].letter !== '' && newGrid[r][c].letter !== word[i]) {
                            canPlace = false;
                            break;
                        }
                    }

                    if (canPlace) {
                        for (let i = 0; i < word.length; i++) {
                            const r = startRow + dir[0] * i;
                            const c = startCol + dir[1] * i;
                            newGrid[r][c].letter = word[i];
                        }
                        placed = true;
                    }
                }
                attempts++;
            }
            if (!placed) console.warn(`No se pudo colocar la palabra: ${word}`);
        };

        // Sort words by length descending so longer words are placed first (easier to fit)
        const sortedWords = [...cleanWords].sort((a, b) => b.length - a.length);
        sortedWords.forEach(placeWord);

        // 3. Fill empty spaces
        const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (newGrid[r][c].letter === '') {
                    newGrid[r][c].letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
                }
            }
        }

        setGrid(newGrid);
    }, [originalWords, GRID_SIZE]);

    // Timer Effect
    useEffect(() => {
        if (isPlaying && !isFinished) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, isFinished]);

    // Start on mount
    useEffect(() => {
        initGame();
    }, [initGame]);

    // Interaction Handlers
    const handlePointerDown = (row: number, col: number, e: React.PointerEvent) => {
        if (isFinished) return;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId); // Allows pointerMove on other elements
        setIsDragging(true);
        setSelectionPath([{ row, col }]);
    };

    const handlePointerMove = (row: number, col: number) => {
        if (!isDragging || isFinished) return;

        // Ensure strictly straight lines (horizontal, vertical, diagonal)
        const start = selectionPath[0];
        const dr = row - start.row;
        const dc = col - start.col;

        // Calculate new path if it forms a direct line
        if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
            const steps = Math.max(Math.abs(dr), Math.abs(dc));
            const sr = dr === 0 ? 0 : dr / Math.abs(dr);
            const sc = dc === 0 ? 0 : dc / Math.abs(dc);

            const newPath = [];
            for (let i = 0; i <= steps; i++) {
                newPath.push({ row: start.row + sr * i, col: start.col + sc * i });
            }
            setSelectionPath(newPath);
        }
    };

    const handlePointerUp = () => {
        if (!isDragging || isFinished) return;
        setIsDragging(false);

        // Check if formed word matches
        const selectedWordForward = selectionPath.map(p => grid[p.row][p.col].letter).join('');
        const selectedWordBackward = [...selectionPath].reverse().map(p => grid[p.row][p.col].letter).join('');

        let match = '';
        if (words.includes(selectedWordForward)) match = selectedWordForward;
        else if (words.includes(selectedWordBackward)) match = selectedWordBackward;

        if (match && !foundWords.includes(match)) {
            const newFoundWords = [...foundWords, match];
            setFoundWords(newFoundWords);

            const newCells = new Set(foundCells);
            selectionPath.forEach(p => newCells.add(`${p.row},${p.col}`));
            setFoundCells(newCells);

            // Win condition
            if (newFoundWords.length === words.length) {
                setIsFinished(true);
                setIsPlaying(false);
                // User now clicks a button to continue, no auto transition
            }
        }
        setSelectionPath([]);
    };

    // Global pointer up to catch releases outside the grid
    useEffect(() => {
        const handleGlobalUp = () => {
            if (isDragging) handlePointerUp();
        };
        window.addEventListener('pointerup', handleGlobalUp);
        return () => window.removeEventListener('pointerup', handleGlobalUp);
    }, [isDragging, handlePointerUp]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const isSelected = (r: number, c: number) => selectionPath.some(p => p.row === r && p.col === c);
    const isFound = (r: number, c: number) => foundCells.has(`${r},${c}`);

    if (words.length === 0) return <div>No hay palabras válidas configuradas para esta actividad.</div>;

    return (
        <Container>
            {isFinished ? (
                <ResultCard>
                    <CheckCircle size={64} color="#12A152" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: '#12A152', margin: '0 0 0.5rem' }}>¡Excelente trabajo!</h2>
                    <p style={{ fontSize: '1.1rem', color: '#5f6368', marginBottom: '1.5rem' }}>
                        Encontraste todas las palabras en <strong>{formatTime(timeElapsed)}</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={initGame}
                            style={{ background: 'white', color: '#5f6368', border: '1px solid #ddd', padding: '0.75rem 1.5rem', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Volver a jugar
                        </button>
                        <button
                            onClick={() => onComplete(timeElapsed)}
                            style={{ background: '#12A152', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Continuar
                        </button>
                    </div>
                </ResultCard>
            ) : (
                <>
                    <GameHeader>
                        <div>
                            <strong>Sopa de Letras</strong>
                            <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Encuentra las {words.length} palabras escondidas.</div>
                        </div>
                        <TimerBox>
                            <Timer size={20} />
                            {formatTime(timeElapsed)}
                        </TimerBox>
                    </GameHeader>

                    <Grid $size={GRID_SIZE} ref={gridRef} style={{ pointerEvents: isFinished ? 'none' : 'auto' }}>
                        {grid.map((row, r) =>
                            row.map((cell, c) => (
                                <Cell
                                    key={`${r}-${c}`}
                                    $selected={isSelected(r, c)}
                                    $found={isFound(r, c)}
                                    onPointerDown={(e) => handlePointerDown(r, c, e)}
                                    onPointerEnter={() => handlePointerMove(r, c)} // For mouse drag
                                    onPointerMove={(e) => {
                                        // Specific handling for touch devices dragging over elements
                                        if (e.pointerType === 'touch' && isDragging) {
                                            const target = document.elementFromPoint(e.clientX, e.clientY);
                                            // Extract row/col if target is a cell... 
                                            // A sturdy trick: we can just attach an id or use event bubbling but it's simpler to rely on PointerEnter for desktop, and for mobile let's just do a basic fallback or ensure elements share a class to parse indices.
                                            // To keep it simple and perfectly functional on touch, we'll assign ids to cells.
                                            if (target && target.id && target.id.startsWith('cell-')) {
                                                const parts = target.id.split('-');
                                                handlePointerMove(Number(parts[1]), Number(parts[2]));
                                            }
                                        }
                                    }}
                                    id={`cell-${r}-${c}`}
                                >
                                    {cell.letter}
                                </Cell>
                            ))
                        )}
                    </Grid>

                    <WordList>
                        {words.map(w => (
                            <WordBagLabel key={w} $found={foundWords.includes(w)}>
                                {w}
                            </WordBagLabel>
                        ))}
                    </WordList>
                </>
            )}
        </Container>
    );
}
