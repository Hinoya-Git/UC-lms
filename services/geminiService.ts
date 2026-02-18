
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeImage = async (base64Image: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

export const analyzeVideo = async (base64Video: string, prompt: string, mimeType: string = 'video/mp4') => {
  const ai = getAIClient();
  // For Gemini 3 Pro Preview, we can send video as inlineData if it's small enough 
  // or use the Prompt to describe what to look for.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: mimeType, data: base64Video } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

export const transcribeAudio = async (base64Audio: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
        { text: "Please transcribe this audio accurately. If there are multiple speakers, identify them if possible." }
      ]
    }
  });
  return response.text;
};
