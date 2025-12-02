import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateEdit(
    imageBase64: string, 
    prompt: string
): Promise<string> {
    
    // Strip header if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    // Extract mime type if present, default to jpeg
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Standard model for image editing
            contents: {
                parts: [
                    { 
                        text: prompt 
                    },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }
        });

        // The response might contain text if the model refuses or explains something, 
        // or an image if successful. We need to parse candidates.
        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            throw new Error("No content generated");
        }

        // Search for the image part
        for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const returnMime = part.inlineData.mimeType || "image/png";
                return `data:${returnMime};base64,${part.inlineData.data}`;
            }
        }

        // If no image part found, check for text to provide a better error
        const textPart = candidate.content.parts.find(p => p.text);
        if (textPart && textPart.text) {
             throw new Error(`Model Response: ${textPart.text}`);
        }

        throw new Error("The model generated content but no image was found.");

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to generate image.");
    }
}