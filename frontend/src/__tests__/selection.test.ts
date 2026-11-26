import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('Selection FSM Tests', () => {
  it('should return to IDLE when selecting piece with no legal moves', () => {
    const { result } = renderHook(() => useGameState());
    
    // Try to select a piece with no legal moves (e.g., blocked pawn)
    act(() => {
      result.current.selectPiece({ row: 6, col: 0 });
    });
    
    // Should be in IDLE state
    expect(result.current.selectionState).toBe('IDLE');
    expect(result.current.gameState.selectedPiece).toBeNull();
  });

  it('should clear selection when clicking same piece', () => {
    const { result } = renderHook(() => useGameState());
    
    // Select a piece with legal moves
    act(() => {
      result.current.selectPiece({ row: 6, col: 4 });
    });
    
    expect(result.current.gameState.selectedPiece).not.toBeNull();
    
    // Click same piece again
    act(() => {
      result.current.selectPiece({ row: 6, col: 4 });
    });
    
    expect(result.current.gameState.selectedPiece).toBeNull();
    expect(result.current.selectionState).toBe('IDLE');
  });

  it('should clear selection when clicking empty square', () => {
    const { result } = renderHook(() => useGameState());
    
    // Select a piece
    act(() => {
      result.current.selectPiece({ row: 6, col: 4 });
    });
    
    // Click empty square
    act(() => {
      result.current.selectPiece({ row: 4, col: 4 });
    });
    
    expect(result.current.gameState.selectedPiece).toBeNull();
  });

  it('should not freeze UI after failed move', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.selectPiece({ row: 6, col: 4 });
    });
    
    // Try invalid move
    act(() => {
      result.current.makeMove({ row: 2, col: 4 });
    });
    
    // Should be back to IDLE
    expect(result.current.selectionState).toBe('IDLE');
  });
});
