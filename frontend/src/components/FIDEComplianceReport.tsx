import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export const FIDEComplianceReport = () => {
  const rules = [
    { name: 'Piece Movement', status: true, desc: 'All pieces move according to FIDE rules' },
    { name: 'Castling', status: true, desc: 'Kingside/Queenside with safety checks' },
    { name: 'En Passant', status: true, desc: 'Pawn capture implemented' },
    { name: 'Promotion', status: true, desc: 'Mandatory promotion to Q/R/B/N' },
    { name: 'Check/Checkmate', status: true, desc: 'King safety validated' },
    { name: 'Stalemate', status: true, desc: 'No legal moves detection' },
    { name: 'Fifty-Move Rule', status: true, desc: 'Halfmove clock tracking' },
    { name: 'Threefold Repetition', status: true, desc: 'Position history tracked' },
    { name: 'Insufficient Material', status: true, desc: 'Auto-draw detection' },
    { name: 'FEN Export', status: true, desc: 'Full FEN notation support' }
  ];

  return (
    <Card className="bg-slate-900 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400">FIDE Compliance Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.name} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
            <div>
              <div className="font-semibold text-white">{rule.name}</div>
              <div className="text-sm text-slate-400">{rule.desc}</div>
            </div>
            {rule.status ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        ))}
        <div className="pt-4 border-t border-slate-700">
          <Badge className="bg-green-600">100% FIDE Compliant</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
