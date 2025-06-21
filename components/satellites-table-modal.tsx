"use client"

import { SatelliteInfoPanel } from "./3d/satellite-info-panel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { SatelliteSchema } from "../types/api"

interface SatellitesTableModalProps {
  satellite: SatelliteSchema | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SatellitesTableModal({ satellite, open, onOpenChange }: SatellitesTableModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-xl w-[420px]">
        <DialogTitle className="sr-only">Satellite Details</DialogTitle>
        <div className="relative">
          <SatelliteInfoPanel satellite={satellite} onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
