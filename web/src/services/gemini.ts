import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async generateClinicalSummary(patientData: any) {
    const prompt = `
      You are a clinical AI assistant. Generate a structured 7-day clinical summary for the following patient data.
      Focus on trends, risks, and actionable insights. Use a professional, concise tone.
      
      Patient: ${patientData.name}, Age: ${patientData.age}
      Risk Score: ${patientData.risk_score} (${patientData.risk_level})
      Symptoms: ${JSON.stringify(patientData.symptoms?.slice(0, 10))}
      Recent Summaries: ${JSON.stringify(patientData.daily_summaries?.slice(0, 3))}
      
      Return only the summary text. No bullet points.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to generate summary at this time.";
    }
  },

  async chatWithDoctor(patientData: any, history: any[], message: string) {
    const systemInstruction = `
      You are Swasthya AI, a highly educated clinical decision support assistant. 
      Your goal is to provide expert-level medical insights.
      
      CONTEXT:
      - Current Patient Data: ${JSON.stringify(patientData)}
      
      CRITICAL INSTRUCTIONS:
      1. PRIORITIZE PATIENT DATA: Always look for answers in the provided patient context first.
      2. GENERAL MEDICAL KNOWLEDGE: If the patient data is insufficient to answer a specific clinical question (e.g., "What causes chest pain?"), use your extensive medical knowledge to provide general reasons, potential causes, and standard precautions for the symptoms mentioned (like head pain, chest pain, sweating, knee pain, vomiting, etc.).
      3. FALLBACK: Only if the question is completely non-medical or totally unrelated to healthcare/patient management, respond with: "No, I don't have much data to answer your question. Sorry, is there anything else you want to ask?"
      4. Maintain a professional, empathetic, and "wow" user-friendly tone.
      5. Clearly distinguish between advice based on the patient's specific data and general medical information.
    `;

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction }
      });

      const response = await chat.sendMessage({ message });
      const text = response.text;
      
      return {
        text,
        answer_found: !text.includes("don't have much data")
      };
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw error;
    }
  }
};
