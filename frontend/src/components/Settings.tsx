import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GameMode } from '../types/game';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode?: GameMode;
  onGameModeChange?: (mode: GameMode) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, gameMode = 'FIDE_COSMIC', onGameModeChange }) => {
  const [use3D, setUse3D] = useState(false);
  const [lowFX, setLowFX] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border-cyan-500/30">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Game Mode</Label>
            <Select value={gameMode} onValueChange={(v) => onGameModeChange?.(v as GameMode)}>
              <SelectTrigger className="bg-slate-800 border-cyan-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-cyan-500/30">
                <SelectItem value="FIDE_CLASSIC">FIDE Classic (Pure Chess)</SelectItem>
                <SelectItem value="FIDE_COSMIC">FIDE + Cosmic (Chess + Abilities)</SelectItem>
                <SelectItem value="COSMIC_ANNIHILATION">Cosmic Annihilation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="3d-mode">3D Board Mode</Label>
            <Switch id="3d-mode" checked={use3D} onCheckedChange={setUse3D} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="low-fx">Low FX Mode</Label>
            <Switch id="low-fx" checked={lowFX} onCheckedChange={setLowFX} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound">Sound Effects</Label>
            <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="coords">Show Coordinates</Label>
            <Switch id="coords" checked={showCoordinates} onCheckedChange={setShowCoordinates} />
          </div>
          <Button onClick={onClose} className="w-full mt-4">Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

