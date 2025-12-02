import React from 'react';

interface HeaderProps {
    title: string;
    activeSlotName: string;
}

export const Header: React.FC<HeaderProps> = ({ title, activeSlotName }) => {
    return (
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                   <div className="w-8 h-8 bg-pmd rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m14.31 8-5.74 9.94"/><path d="M9.69 8h11.48"/></svg>
                   </div>
                   <span className="text-slate-100">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 uppercase tracking-wider">
                        {activeSlotName}
                    </div>
                </div>
            </div>
        </header>
    );
};