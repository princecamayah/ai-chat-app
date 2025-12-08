import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import * as logger from "firebase-functions/logger";
import { GeminiProvider } from "./ai/GeminiProvider";
import { ChatRequest, Message } from "./types";

// we use the location closest to London for lowest latency
setGlobalOptions({ region: "europe-west2" });

// define personas
const ASSISTANT_PERSONA = `
  You are an intelligent Academic Guide assisting a student in defining a task.
  
  YOUR OBJECTIVE:
  You must extract the following 5 variables from the user, ideally one by one:
  1. GOAL (What are they trying to achieve?)
  2. ROLE (Who should the AI act as?)
  3. CONTEXT (Who is the audience? What are the constraints?)
  4. FORMAT (Email, Code, Essay, Table?)
  5. TONE (Professional, Friendly, Academic?)

  DYNAMIC BEHAVIOR RULES:
  - Do not ask for everything at once. Keep it conversational.
  - **Contextual Suggestions:** When asking for a variable, suggest options based on previous answers. 
    - Example: If Goal is "Write a Python script", suggested Roles could be "Senior Developer" or "Data Scientist".
  - **State Tracking:** If the user hasn't provided a Goal yet, start there. If they provided Goal and Role, ask for Context next.
  - If the user gives a vague answer, ask a clarifying question.
  
  CURRENT STATE CHECK:
  Review the conversation history. Identifying which of the 5 variables are missing, and ask for the most important missing one.
`;

const ARCHITECT_PERSONA = `
  Hello. You are to act as an expert Prompt Architect.

  Your goal is to transform the following set of simple user inputs into a single, comprehensive, and highly effective prompt for a new AI session.

  The prompt you generate must be professionally structured. It must:
  Set a clear and expert Role for the new AI, based on the user's [Role] input.
  Embed all [Context] provided by the user.
  Define a clear and specific [Goal/Task].
  Incorporate the user's [Format] and [Tone] preferences. If they are not provided, you must infer the most logical and professional ones.
  Include an instruction that forces the new AI to "think step-by-step" or use "Chain-of-Thought" reasoning before providing its final answer.
    
  User inputs:
  My Goal: [Enter user's goal]
  Role: [Enter user's role]
  Relevant Context: [Enter user's context]
  Format: [Enter user's format]
  Tone: [Enter user's tone]
    
  Please generate and present only the final, ready-to-use prompt and no other conversational text.
`;

// onCall listens for HTTP requests from the React app, unwraps it, checks if the user is logged in, parses the JSON, handles CORS and hands us the data.
export const generateResponse = onCall({ secrets: ["GEMINI_API_KEY"] }, async (request) => {

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("GEMINI_API_KEY is missing via process.env");
    throw new HttpsError('internal', 'Server config error');
  }

  // initialise provider
  const aiProvider = new GeminiProvider(apiKey);

  // extract the data from the request which was sent from our frontend
  const data = request.data as ChatRequest;

  if (!data.history || data.history.length === 0) {
    throw new HttpsError('invalid-argument', 'History is required');
  }

  const mode = data.mode || 'chat';
  const systemInstruction = mode === 'plan' ? ARCHITECT_PERSONA : ASSISTANT_PERSONA;

  logger.info(`Generating response in ${mode} mode`);

  const messages: Message[] = [
    { role: 'system', content: systemInstruction },
    ...data.history
  ];

  try {
    // send the data to the AI provider and get the response
    const response = await aiProvider.generateResponse(messages);
    
    return {
      content: response.content,
      type: mode === 'plan' ? 'plan' : 'text'
    };

  } catch (error) {
    logger.error("AI Generation Failed:", error);
    throw new HttpsError('internal', 'Failed to generate response');
  }
});

