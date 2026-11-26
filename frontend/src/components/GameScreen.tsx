import React, { useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { GameHUD } from './GameHUD';
import CheckmateModal from './CheckmateModal';
import { PromotionModal } from './PromotionModal';
import { useGameState } from '../hooks/useGameState';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePerformance } from '../hooks/usePerformance';
import { handlePassAction } from '../utils/gameState';
import { isCheckmate, isInCheck, getAllLegalMoves } from '../utils/chessLogic';
import { getBestAction, AIDifficulty } from '../utils/aiOpponentV2';
import { captureError, addBreadcrumb } from '../utils/sentry';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { enumerateActions } from '../utils/actionEnumerator';
import { PieceType } from '../data/pieceTypes';


const DEPTH_CONFIG: Record<AIDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4
};

const trackEvent = (event: string, props: any) => {
  posthog.capture(event, props);
};



interface GameScreenProps {
  onBack: () => void;
  vsAI?: boolean;
  aiDifficulty?: AIDifficulty;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBack, vsAI = false, aiDifficulty = 'medium' }) => {
  const { gameState, selectPiece, makeMove, resetGame, selectionVersion } = useGameState();
  const { trackGameStart, trackGameEnd } = useAnalytics();
  const { fps } = usePerformance();


  const [showCheckmateModal, setShowCheckmateModal] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [gameMode, setGameMode] = useState<'STANDARD' | 'ANNIHILATION'>('STANDARD');
  const [ratedLocked, setRatedLocked] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiThinkingStart, setAiThinkingStart] = useState<number | null>(null);
  const [showSlowAIWarning, setShowSlowAIWarning] = useState(false);
  const [startTime] = useState(Date.now());


  // Track game start
  useEffect(() => {
    trackGameStart(vsAI ? 'ai' : 'multiplayer', vsAI ? aiDifficulty : undefined);
    addBreadcrumb('Game started', 'game', { vsAI, aiDifficulty, gameMode });
  }, []);

  // Check for checkmate
  useEffect(() => {
    if (gameMode === 'STANDARD') {
      const currentPlayer = gameState.currentPlayer;
      if (isCheckmate(gameState.board, currentPlayer)) {
        const winningPlayer = currentPlayer === 'white' ? 'black' : 'white';
        setWinner(winningPlayer);
        setShowCheckmateModal(true);
      }
    } else if (gameMode === 'ANNIHILATION') {
      const whitePieces = gameState.board.flat().filter(p => p && p.player === 'white');
      const blackPieces = gameState.board.flat().filter(p => p && p.player === 'black');
      
      if (whitePieces.length === 0) {
        alert('Black wins by Annihilation!');
        resetGame();
        onBack();
      } else if (blackPieces.length === 0) {
        alert('White wins by Annihilation!');
        resetGame();
        onBack();
      }
    }
  }, [gameState.board, gameState.currentPlayer, gameMode]);

  // AI move with strict phase gating
  useEffect(() => {
    // CRITICAL: AI only runs when phase === 'PLAYING'
    if (gameState.phase !== 'PLAYING') {
      setIsAIThinking(false);
      setShowSlowAIWarning(false);
      return;
    }

    if (vsAI && gameState.currentPlayer === 'black' && !showCheckmateModal && !isAIThinking) {
      setIsAIThinking(true);
      setAiThinkingStart(Date.now());
      setShowSlowAIWarning(false);
      
      addBreadcrumb('AI thinking started', 'ai', { difficulty: aiDifficulty, phase: gameState.phase });
      
      // 6s watchdog for slow AI warning
      const watchdog = setTimeout(() => {
        setShowSlowAIWarning(true);
        addBreadcrumb('AI taking longer than usual', 'warning', { difficulty: aiDifficulty });
        trackEvent('ai_watchdog_triggered', { difficulty: aiDifficulty });
      }, 6000);
      
      setTimeout(() => {
        try {
          // Use minimax algorithm to get best action
          const bestAction = getBestAction(
            gameState.board, 
            'black', 
            aiDifficulty, 
            gameMode, 
            gameState
          );
          
          // Handle different action types
          if (bestAction.type === 'PASS') {
            toast.info('AI passes - no legal moves');
            const newState = handlePassAction(gameState);
            trackEvent('pass_turn', { player: 'black', mode: gameMode });
            setIsAIThinking(false);
            setShowSlowAIWarning(false);
            clearTimeout(watchdog);
            return;
          }
          
          if (bestAction.type === 'TERMINAL') {
            // AI detected checkmate/stalemate
            if (bestAction.result === 'DRAW_STALEMATE') {
              toast.info('Stalemate - Draw!');
            } else {
              toast.success('Checkmate! You win!');
              setWinner('white');
              setShowCheckmateModal(true);
            }
            setIsAIThinking(false);
            setShowSlowAIWarning(false);
            clearTimeout(watchdog);
            return;
          }
          
          if (bestAction.type === 'MOVE' && bestAction.from && bestAction.to) {
            // Execute the best move found by minimax
            selectPiece(bestAction.from);
            setTimeout(() => {
              makeMove(bestAction.to!);
              setIsAIThinking(false);
              setShowSlowAIWarning(false);
              
              const thinkTime = Date.now() - (aiThinkingStart || Date.now());
              trackEvent('ai_move_completed', { 
                difficulty: aiDifficulty, 
                thinkTime,
                depth: DEPTH_CONFIG[aiDifficulty]
              });
            }, 300);
          } else {
            // Fallback: no valid move found
            toast.error('AI could not find a valid move');
            setIsAIThinking(false);
            setShowSlowAIWarning(false);
          }

        } catch (error) {
          captureError(error as Error);
          setIsAIThinking(false);
          setShowSlowAIWarning(false);
        }
        clearTimeout(watchdog);
      }, 500);
    }

  }, [gameState.currentPlayer, gameState.phase, gameState.board, vsAI, showCheckmateModal, isAIThinking, gameMode]);


  // Clear AI thinking on phase change
  useEffect(() => {
    if (gameState.phase !== 'PLAYING') {
      setIsAIThinking(false);
      setShowSlowAIWarning(false);
      addBreadcrumb('phase_changed', 'game', { phase: gameState.phase });
    }
  }, [gameState.phase]);



  const handleSquareClick = (position: { row: number; col: number }) => {
    if (vsAI && gameState.currentPlayer === 'black') return;
    if (gameState.selectedPiece) {
      makeMove(position);
    } else {
      selectPiece(position);
    }
  };

  const handleEndGame = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    trackGameEnd('checkmate', duration);
    addBreadcrumb('Game ended', 'game', { winner, duration, gameMode });
    setShowCheckmateModal(false);
    toast.success(`${winner === 'white' ? 'White' : 'Black'} wins by Checkmate!`);
    resetGame();
    onBack();
  };

  const handleContinue = () => {
    setGameMode('ANNIHILATION');
    setRatedLocked(true);
    setShowCheckmateModal(false);
    addBreadcrumb('Switched to Annihilation Mode', 'game', { gameMode: 'ANNIHILATION' });
    toast.info('Continuing in Annihilation Mode - Rated result locked');
  };


  return (
    <div 
      className="min-h-screen bg-slate-950 text-white p-4 md:p-8"
      style={{
        backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764262782709_b773fe31.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800/80 backdrop-blur-sm rounded-lg transition-colors border border-cyan-500/30"
          >
            ← Back to Menu
          </button>
          <div className="flex gap-2">
            {gameMode === 'ANNIHILATION' && (
              <div className="px-4 py-2 bg-purple-600/80 backdrop-blur-sm rounded-lg border border-purple-400/50">
                Annihilation Mode
              </div>
            )}
            {ratedLocked && (
              <div className="px-4 py-2 bg-yellow-600/80 backdrop-blur-sm rounded-lg border border-yellow-400/50 text-sm">
                Rated result locked
              </div>
            )}
            {isInCheck(gameState.board, gameState.currentPlayer) && gameMode === 'STANDARD' && (
              <div className="px-4 py-2 bg-red-600/80 backdrop-blur-sm rounded-lg border border-red-400/50 animate-pulse">
                Check!
              </div>
            )}
            {showSlowAIWarning && (
              <div className="px-4 py-2 bg-orange-600/80 backdrop-blur-sm rounded-lg border border-orange-400/50 animate-pulse">
                AI taking longer than usual...
              </div>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChessBoard gameState={gameState} onSquareClick={handleSquareClick} />
          </div>
          
          <div>
            <GameHUD gameState={gameState} onReset={resetGame} isAIThinking={isAIThinking} />
          </div>
        </div>
      </div>

      {winner && (
        <CheckmateModal
          isOpen={showCheckmateModal}
          winner={winner}
          isRated={true}
          onEndGame={handleEndGame}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};

