import React from 'react';

interface HeaderProps {
    title: string;
    activeSlotName: string;
}

export const Header: React.FC<HeaderProps> = ({ title, activeSlotName }) => {
    return (
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-end">
                <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 uppercase tracking-wider">
                        {activeSlotName}
                    </div>
                </div>
            </div>
        </header>
    );
};