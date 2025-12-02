import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Workspace } from './components/Workspace';
import { SlotNavigation } from './components/SlotNavigation';
import { INITIAL_SLOTS } from './constants';
import { Slot, SlotUpdate } from './types';
import { processImageForExport } from './utils/imageUtils';
import JSZip from 'jszip';

const App: React.FC = () => {
    const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
    const [activeSlotId, setActiveSlotId] = useState<number>(0);
    const [isZipping, setIsZipping] = useState<boolean>(false);
    const [zipError, setZipError] = useState<string | null>(null);

    const activeSlot = slots.find(s => s.id === activeSlotId) || slots[0];

    const updateSlot = useCallback((id: number, updates: SlotUpdate) => {
        setSlots(prev => prev.map(slot => 
            slot.id === id ? { ...slot, ...updates } : slot
        ));
    }, []);

    const handleDownloadAll = async () => {
        const generatedSlots = slots.filter(s => s.generatedImage);
        if (generatedSlots.length === 0) return;

        setIsZipping(true);
        setZipError(null);

        try {
            const zip = new JSZip();
            const folder = zip.folder("pmd_images");

            if (!folder) throw new Error("Could not create zip folder");

            const promises = generatedSlots.map(async (slot) => {
                const finalBase64 = await processImageForExport(slot.generatedImage!);
                const base64Data = finalBase64.split(',')[1];
                const safeName = slot.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                const fileName = `pmd-${safeName}-${slot.id + 1}.jpg`;
                
                folder.file(fileName, base64Data, {base64: true});
            });

            await Promise.all(promises);

            const content = await zip.generateAsync({type:"blob"});
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = "pmd-digital-media-all.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error zipping files", err);
            setZipError("Failed to create ZIP file.");
        } finally {
            setIsZipping(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-pmd selection:text-white flex flex-col">
            <Header title="PMD Editor" activeSlotName={activeSlot.name} />
            
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8 flex flex-col">
                {zipError && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
                        {zipError}
                    </div>
                )}
                
                <Workspace 
                    slot={activeSlot} 
                    onUpdate={(updates) => updateSlot(activeSlot.id, updates)}
                    onDownloadAll={handleDownloadAll}
                    hasAnyGeneratedImages={slots.some(s => s.generatedImage)}
                    isZipping={isZipping}
                />
            </main>

            <SlotNavigation 
                slots={slots} 
                activeSlotId={activeSlotId} 
                onSelectSlot={setActiveSlotId} 
            />
            
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pmd/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-pmd/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default App;