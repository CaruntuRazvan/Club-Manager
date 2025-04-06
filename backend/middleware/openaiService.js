const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateFeedbackSummary(comments) {
  const messages = [
    { 
      role: "system", 
      content: "You are an assistant for a football coach. Summarize the feedback objectively so that the coach can assess the player's performance and engagement over time." 
    },
    { 
      role: "user", 
      content: `Here are multiple feedback comments regarding a player's performance and behavior: ${comments.join("; ")}.\nGenerate a short and objective summary for the coach.` 
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
}

module.exports = { generateFeedbackSummary };
