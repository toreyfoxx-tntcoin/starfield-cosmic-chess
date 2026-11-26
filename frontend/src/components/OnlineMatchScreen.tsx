import React, { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeMatch } from '@/hooks/useRealtimeMatch';
import { ChessBoard } from './ChessBoard';
import { ChatPanel } from './ChatPanel';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { apiClient } from '@/lib/apiClient';
import { getValidMoves, isSamePosition } from '@/utils/chessLogic';
import type { GamePiece, GameState, Position } from '@/types/game';
import type { PieceType, Player } from '@/data/pieceTypes';

interface OnlineMatchScreenProps {
  matchId: string;
  onBack: () => void;
}

const FEN_PIECE_MAP: Record<string, { type: PieceType; player: Player }> = {
  P: { type: 'pawn', player: 'white' },
  R: { type: 'rook', player: 'white' },
  N: { type: 'knight', player: 'white' },
  B: { type: 'bishop', player: 'white' },
  Q: { type: 'queen', player: 'white' },
  K: { type: 'king', player: 'white' },
  p: { type: 'pawn', player: 'black' },
  r: { type: 'rook', player: 'black' },
  n: { type: 'knight', player: 'black' },
  b: { type: 'bishop', player: 'black' },
  q: { type: 'queen', player: 'black' },
  k: { type: 'king', player: 'black' },
};

function squareToPosition(sq: string): Position | null {
  if (!sq || sq === '-' || sq.length !== 2) return null;
  const col = sq.charCodeAt(0) - 97;
  const row = 8 - parseInt(sq[1], 10);
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  return { row, col };
}

function positionToSquare(pos: Position): string {
  return `${String.fromCharCode(97 + pos.col)}${8 - pos.row}`;
}

function fenToBoardState(
  fen: string,
  selectedPiece: GamePiece | null,
  validMoves: Position[]
): GameState {
  const parts = (fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').split(' ');
  const rows = parts[0].split('/');
  const turn: Player = parts[1] === 'b' ? 'black' : 'white';
  const castling = parts[2] || '-';
  const epTarget = squareToPosition(parts[3] || '-');

  const board: (GamePiece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  rows.forEach((fenRow, rIdx) => {
    let cIdx = 0;
    for (const ch of fenRow) {
      if (ch >= '1' && ch <= '8') {
        cIdx += parseInt(ch, 10);
      } else if (FEN_PIECE_MAP[ch]) {
        const info = FEN_PIECE_MAP[ch];
        board[rIdx][cIdx] = {
          id: `${info.player}-${info.type}-${rIdx}-${cIdx}`,
          type: info.type,
          player: info.player,
          position: { row: rIdx, col: cIdx },
          hasMoved:
            (info.type === 'pawn' &&
              ((info.player === 'white' && rIdx !== 6) || (info.player === 'black' && rIdx !== 1))) ||
            (info.type === 'king' && !castling.includes(info.player === 'white' ? 'K' : 'k') && !castling.includes(info.player === 'white' ? 'Q' : 'q')),
          cooldowns: {},
          usesLeft: {},
          isStunned: false,
          hasShield: false,
        };
        cIdx += 1;
      }
    }
  });

  return {
    board,
    currentPlayer: turn,
    selectedPiece,
    validMoves,
    capturedPieces: { white: [], black: [] },
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    turnCount: parseInt(parts[5] || '1', 10),
    eventHorizonZones: [],
    mode: 'FIDE_CLASSIC',
    consecutivePasses: 0,
    phase: 'PLAYING',
    pendingPromotion: null,
    enPassantTarget: epTarget,
    halfmoveClock: parseInt(parts[4] || '0', 10),
    fullmoveNumber: parseInt(parts[5] || '1', 10),
    positionHistory: [],
    castlingRights: {
      whiteKingside: castling.includes('K'),
      whiteQueenside: castling.includes('Q'),
      blackKingside: castling.includes('k'),
      blackQueenside: castling.includes('q'),
    },
  };
}

export const OnlineMatchScreen: React.FC<OnlineMatchScreenProps> = ({ matchId, onBack }) => {
  const { user } = useAuth();
  const playerId = user?.uid || '';
  const { matchState, connected, reconnecting, sendMove, sendAction } = useRealtimeMatch({
    matchId,
    playerId,
  });

  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [endorsed, setEndorsed] = useState<string | null>(null);

  const myColor: Player | null = useMemo(() => {
    if (!matchState || !playerId) return null;
    if (matchState.players.white.uid === playerId) return 'white';
    if (matchState.players.black.uid === playerId) return 'black';
    return null;
  }, [matchState, playerId]);

  const opponent = useMemo(() => {
    if (!matchState || !myColor) return null;
    return myColor === 'white' ? matchState.players.black : matchState.players.white;
  }, [matchState, myColor]);

  const gameState = useMemo(() => {
    return fenToBoardState(matchState?.fen || '', selectedPiece, validMoves);
  }, [matchState?.fen, selectedPiece, validMoves]);

  const isMyTurn = Boolean(
    matchState &&
      matchState.status === 'active' &&
      myColor &&
      ((matchState.turn === 'w' && myColor === 'white') ||
        (matchState.turn === 'b' && myColor === 'black'))
  );

  const executeMove = async (from: Position, to: Position, promo?: 'q' | 'r' | 'b' | 'n') => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const uci = `${positionToSquare(from)}${positionToSquare(to)}${promo || ''}`;
      await sendMove(uci);
      setSelectedPiece(null);
      setValidMoves([]);
      setPendingPromotion(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Move rejected by server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSquareClick = (pos: Position) => {
    if (!isMyTurn || submitting || !myColor) return;
    setErrorMsg(null);

    const clickedPiece = gameState.board[pos.row][pos.col];

    // If tapping a valid move destination for currently selected piece
    if (selectedPiece && validMoves.some((m) => isSamePosition(m, pos))) {
      const isPawnPromo =
        selectedPiece.type === 'pawn' &&
        ((myColor === 'white' && pos.row === 0) || (myColor === 'black' && pos.row === 7));

      if (isPawnPromo) {
        setPendingPromotion({ from: selectedPiece.position, to: pos });
      } else {
        executeMove(selectedPiece.position, pos);
      }
      return;
    }

    // Select own piece
    if (clickedPiece && clickedPiece.player === myColor) {
      const moves = getValidMoves(clickedPiece, gameState.board, gameState.enPassantTarget, true);
      setSelectedPiece(clickedPiece);
      setValidMoves(moves);
    } else {
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const handleEndorse = async (tag: 'honorable_strategist' | 'friendly_pioneer' | 'bold_tactician') => {
    setErrorMsg(null);
    try {
      await apiClient.post(`/api/v1/matches/${matchId}/endorse`, { tag });
      setEndorsed(tag);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not record endorsement.');
    }
  };

  if (!matchState) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="animate-pulse text-cyan-400 text-lg">Syncing Starfield Match...</div>
        <Button variant="outline" onClick={onBack}>← Back to Command Deck</Button>
      </div>
    );
  }

  const hasIncomingDrawOffer =
    matchState.draw_offer_by && matchState.draw_offer_by !== playerId && matchState.status === 'active';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-3 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Command Deck
          </Button>
          <div className="flex items-center gap-2 text-xs">
            <Badge className={connected ? 'bg-emerald-700' : 'bg-amber-700'}>
              {reconnecting ? 'Reconnecting...' : connected ? 'Live Sync' : 'Connecting'}
            </Badge>
            <Badge variant="outline" className="border-cyan-500/40 text-cyan-300">
              {matchState.mode === 'correspondence_24h' ? '24h Correspondence' : '10m Live Rapid'}
            </Badge>
          </div>
        </div>

        {/* Main Grid: Board + Match Comms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Board Column */}
          <div className="lg:col-span-7 space-y-3">
            {/* Opponent Banner */}
            <Card className="p-3 bg-slate-900/90 border-cyan-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Opponent ({myColor === 'white' ? 'Black' : 'White'})</div>
                <div className="font-bold text-cyan-300">@{opponent?.username || 'Pioneer'}</div>
              </div>
              <Badge className={isMyTurn ? 'bg-emerald-600' : 'bg-slate-700'}>
                {matchState.status === 'completed'
                  ? `Finished: ${matchState.result?.replace('_', ' ')}`
                  : isMyTurn
                  ? 'Your Turn!'
                  : `Waiting on @${opponent?.username || 'Opponent'}`}
              </Badge>
            </Card>

            {/* Draw Offer Alert */}
            {hasIncomingDrawOffer && (
              <Card className="p-3 bg-amber-950/60 border-amber-500/40 flex items-center justify-between gap-2">
                <span className="text-sm text-amber-200">@{opponent?.username} offered a draw.</span>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-600" onClick={() => sendAction('accept_draw')}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => sendAction('decline_draw')}>
                    Decline
                  </Button>
                </div>
              </Card>
            )}

            {/* Pawn Promotion Modal */}
            {pendingPromotion && (
              <Card className="p-3 bg-indigo-950/90 border-cyan-400 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-cyan-200">Promote Pawn to:</span>
                <div className="flex gap-2">
                  {(['q', 'r', 'b', 'n'] as const).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      onClick={() => executeMove(pendingPromotion.from, pendingPromotion.to, p)}
                      className="bg-cyan-600 hover:bg-cyan-500 uppercase font-bold"
                    >
                      {p === 'q' ? 'Queen' : p === 'r' ? 'Rook' : p === 'b' ? 'Bishop' : 'Knight'}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Playable Cosmic Board */}
            <ChessBoard gameState={gameState} onSquareClick={handleSquareClick} />

            {errorMsg && (
              <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-200 text-center">
                {errorMsg}
              </div>
            )}

            {/* Match Controls */}
            {matchState.status === 'active' && (
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <span className="text-xs text-slate-400">
                  Playing as <strong className="text-white uppercase">{myColor}</strong> • Move {matchState.moves_san?.length || 0}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendAction('offer_draw')}
                    className="text-xs"
                  >
                    Offer Draw
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Resign this match honorably?')) {
                        sendAction('resign');
                      }
                    }}
                    className="text-xs"
                  >
                    Resign
                  </Button>
                </div>
              </div>
            )}

            {/* Post-Match Sportsmanship Endorsement Card */}
            {matchState.status === 'completed' && (
              <Card className="p-4 bg-gradient-to-br from-indigo-950/90 to-slate-900 border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-300 text-lg">
                    Match Complete — {matchState.termination?.replace(/_/g, ' ')}
                  </h3>
                  <Badge className="bg-cyan-700">{matchState.result?.replace(/_/g, ' ')}</Badge>
                </div>
                {endorsed ? (
                  <p className="text-sm text-emerald-200">
                    Thank you! You endorsed @{opponent?.username} as <strong>{endorsed.replace(/_/g, ' ')}</strong>.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-300">
                      Endorse @{opponent?.username} for sportsmanship (available on matches with 8+ moves):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => handleEndorse('honorable_strategist')} className="bg-emerald-700 hover:bg-emerald-600 text-xs">
                        ★ Honorable Strategist
                      </Button>
                      <Button size="sm" onClick={() => handleEndorse('friendly_pioneer')} className="bg-cyan-700 hover:bg-cyan-600 text-xs">
                        ★ Friendly Pioneer
                      </Button>
                      <Button size="sm" onClick={() => handleEndorse('bold_tactician')} className="bg-purple-700 hover:bg-purple-600 text-xs">
                        ★ Bold Tactician
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Chat & Safety Column */}
          <div className="lg:col-span-5 space-y-4">
            <ChatPanel matchId={matchId} userId={playerId} opponentUid={opponent?.uid} />

            {/* Move List */}
            <Card className="p-4 bg-slate-900/80 border-cyan-500/20">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Recorded Moves ({matchState.moves_san?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs max-h-32 overflow-y-auto">
                {(matchState.moves_san || []).length === 0 ? (
                  <span className="text-slate-500 italic">Waiting for opening move...</span>
                ) : (
                  matchState.moves_san.map((san, idx) => (
                    <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-cyan-200">
                      {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                      {san}
                    </span>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
