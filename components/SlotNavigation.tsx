import React from 'react';
import { Plus } from 'lucide-react';
import { Slot } from '../types';

interface SlotNavigationProps {
    slots: Slot[];
    activeSlotId: number;
    onSelectSlot: (id: number) => void;
}

export const SlotNavigation: React.FC<SlotNavigationProps> = ({ slots, activeSlotId, onSelectSlot }) => {
    return (
        <footer className="bg-slate-900/90 border-t border-slate-800 p-4 sticky bottom-0 z-40 backdrop-blur-md">
            <div className="max-w-6xl mx-auto">
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3 text-center tracking-widest">Workspace Slots</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin md:justify-center px-4 overflow-visible">
                    {slots.map((slot) => (
                        <button
                            key={slot.id}
                            onClick={() => onSelectSlot(slot.id)}
                            className={`
                                flex-shrink-0 w-24 h-24 rounded-lg border-2 relative transition-all group
                                ${activeSlotId === slot.id 
                                    ? 'border-pmd ring-2 ring-pmd/20 scale-105' 
                                    : 'border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            <div className="w-full h-full rounded-md overflow-hidden relative">
                                {slot.generatedImage ? (
                                    <img src={slot.generatedImage} className="w-full h-full object-cover" alt={slot.name} />
                                ) : slot.sourceImage ? (
                                    <img src={slot.sourceImage} className="w-full h-full object-cover grayscale" alt={`${slot.name} source`} />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500 gap-1 p-2 text-center">
                                        <Plus className="w-6 h-6 shrink-0" />
                                        <span className="text-[9px] leading-tight line-clamp-2">{slot.name}</span>
                                    </div>
                                )}
                                {/* Status Indicator */}
                                <div className="absolute top-1 right-1">
                                    {slot.generatedImage && <div className="w-2 h-2 rounded-full bg-pmd shadow-md shadow-orange-500" />}
                                </div>
                            </div>

                            {/* Annotation Tooltip for Slot 1 (ID 0) */}
                            {slot.id === 0 && (
                                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-max bg-pmd text-white text-[10px] font-bold py-1.5 px-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                                    Convert your daytime to dusk
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-pmd"></div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </footer>
    );
};