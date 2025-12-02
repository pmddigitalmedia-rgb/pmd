export interface Slot {
    id: number;
    name: string;
    prompt: string;
    sourceImage: string | null;
    generatedImage: string | null;
}

export type SlotUpdate = Partial<Omit<Slot, 'id'>>;

export enum ImageStatus {
    IDLE = 'IDLE',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
}