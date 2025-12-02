import React, { useRef, useState } from 'react';
import { Upload, Zap, Download, Archive, RefreshCw, Trash2, ImageIcon, AlertCircle } from 'lucide-react';
import { Slot, SlotUpdate } from '../types';
import { generateEdit } from '../services/geminiService';
import { processImageForExport } from '../utils/imageUtils';

interface WorkspaceProps {
    slot: Slot;
    onUpdate: (updates: SlotUpdate) => void;
    onDownloadAll: () => void;
    hasAnyGeneratedImages: boolean;
    isZipping: boolean;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
    slot, 
    onUpdate, 
    onDownloadAll, 
    hasAnyGeneratedImages, 
    isZipping 
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File size too large. Please upload an image under 10MB.");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ sourceImage: reader.result as string, generatedImage: null });
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ sourceImage: reader.result as string, generatedImage: null });
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!slot.sourceImage) return;

        setIsLoading(true);
        setError(null);

        try {
            const resultImage = await generateEdit(slot.sourceImage, slot.prompt);
            onUpdate({ generatedImage: resultImage });
        } catch (err: any) {
            setError(err.message || "Failed to generate image.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCurrent = async () => {
        if (slot.generatedImage) {
            try {
                const finalBase64 = await processImageForExport(slot.generatedImage);
                const link = document.createElement('a');
                link.href = finalBase64;
                const safeName = slot.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                link.download = `pmd-${safeName}-${slot.id + 1}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("Error processing image download", err);
                setError("Failed to process image for download.");
            }
        }
    };

    const clearSlot = () => {
        onUpdate({ sourceImage: null, generatedImage: null });
        setError(null);
        // Reset file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Source Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-slate-300">Original Source</h2>
                        {slot.sourceImage && (
                            <button 
                                onClick={clearSlot}
                                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear Slot
                            </button>
                        )}
                    </div>

                    <div 
                        className={`
                            relative h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden bg-slate-800/30
                            ${slot.sourceImage ? 'border-slate-700' : 'border-slate-700 hover:border-pmd hover:bg-slate-800/50 cursor-pointer'}
                        `}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !slot.sourceImage && fileInputRef.current?.click()}
                    >
                        {slot.sourceImage ? (
                            <img 
                                src={slot.sourceImage} 
                                alt="Original" 
                                className="w-full h-full object-contain p-2"
                            />
                        ) : (
                            <div className="text-center p-6 pointer-events-none">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-300 mb-1">Upload to {slot.name}</p>
                                <p className="text-sm text-slate-500">Click or drag & drop</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                        />
                    </div>
                </div>

                {/* Generated Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-slate-300">PMD Output</h2>
                        <div className="flex items-center gap-2">
                            {slot.generatedImage && (
                                <button 
                                    onClick={handleDownloadCurrent}
                                    className="flex items-center gap-2 text-xs font-bold text-white hover:text-slate-100 bg-pmd hover:bg-pmd-hover px-3 py-1 rounded-full transition-colors shadow-lg shadow-pmd/20"
                                >
                                    <Download className="w-3 h-3" />
                                    SAVE JPEG
                                </button>
                            )}
                            {hasAnyGeneratedImages && (
                                <button 
                                    onClick={onDownloadAll}
                                    disabled={isZipping}
                                    className={`
                                        flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full transition-colors border
                                        ${!isZipping 
                                            ? 'text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 border-slate-600' 
                                            : 'text-slate-500 bg-slate-800 border-slate-700 cursor-not-allowed'}
                                    `}
                                    title="Download all generated images as ZIP"
                                >
                                    <Archive className="w-3 h-3" />
                                    {isZipping ? 'ZIPPING...' : 'SAVE ALL'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative h-[400px] bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center">
                        {isLoading ? (
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-pmd/30 border-t-pmd rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-pmd font-medium animate-pulse">Processing {slot.name}...</p>
                            </div>
                        ) : slot.generatedImage ? (
                            <img 
                                src={slot.generatedImage} 
                                alt="Generated" 
                                className="w-full h-full object-contain p-2 animate-fade-in"
                            />
                        ) : (
                            <div className="text-center p-6 opacity-40">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-400">Waiting for input...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="mt-2 flex justify-center">
                <button
                    onClick={handleGenerate}
                    disabled={!slot.sourceImage || isLoading}
                    className={`
                        relative group overflow-hidden rounded-full px-8 py-4 font-bold text-lg transition-all transform hover:scale-105 active:scale-95
                        ${!slot.sourceImage || isLoading 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-pmd text-white hover:bg-pmd-hover shadow-[0_0_30px_rgba(246,134,34,0.3)] hover:shadow-[0_0_50px_rgba(246,134,34,0.6)]'
                        }
                    `}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                        {isLoading ? 'GENERATING...' : 'PMD THIS PUPPY'}
                    </span>
                </button>
            </div>
            
            <div className="text-center">
               <p className="text-xs text-slate-500 font-mono mt-2">{slot.prompt}</p>
            </div>
        </div>
    );
};