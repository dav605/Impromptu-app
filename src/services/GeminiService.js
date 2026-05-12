export class GeminiService {
  constructor() {}

  async analyzeSpeech(topic, transcript) {
    const { puter } = await import('@heyputer/puter.js');

    const prompt = `
      You are an expert speech coach. Analyze the following impromptu speech transcript based on the assigned topic. Pay special attention to the speaker's tone and delivery.
      Provide the result STRICTLY as a valid JSON object with the exact schema below.
      Do NOT include markdown formatting like \`\`\`json or \`\`\` around the output. Only return the raw JSON text.

      {
        "metrics": {
          "confidenceScore": 85,
          "wordsPerMinute": 130,
          "fillerWordCount": 3,
          "tone": "Confident and persuasive"
        },
        "feedback": {
          "strengths": ["Strong opening hook", "Clear articulation"],
          "weaknesses": ["Relied on 'um' and 'like'", "Conclusion felt rushed"],
          "detailedFeedback": "Overall, your speech was compelling. However, try to..."
        }
      }

      Assigned Topic: "${topic}"
      Speech Transcript: "${transcript}"
    `;

    try {
      const puterRes = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
      if (puterRes && puterRes.error) throw new Error(puterRes.error || puterRes.message);
      
      let responseText = typeof puterRes === 'string' ? puterRes : puterRes.toString();
      
      // Clean up markdown if AI includes it
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('\`\`\`json')) {
        cleanJson = cleanJson.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
      } else if (cleanJson.startsWith('\`\`\`')) {
        cleanJson = cleanJson.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');
      }
      
      try {
        return JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", cleanJson);
        throw new Error("AI returned invalid data format. Please try analyzing again.");
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw new Error(error.message || "Failed to analyze speech.");
    }
  }
}
