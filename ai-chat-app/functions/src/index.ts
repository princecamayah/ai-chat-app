import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import * as logger from "firebase-functions/logger";
import { GeminiProvider } from "./ai/GeminiProvider";
import { ChatRequest, Message } from "./types";

// we use the location closest to London for lowest latency
setGlobalOptions({ region: "europe-west2" });

// define personas
const DISCOVERY_PROMPT = `
  You are an intelligent Strategic Thinking Partner assisting a user in clearly defining a goal or project.
  
  YOUR OBJECTIVE:
  You must extract the following 5 variables from the user, ideally one by one:
  1. GOAL (What are they trying to achieve?)
  2. ROLE (Who should the AI act as? e.g. Senior Developer, Editor, Fitness Coach, etc.)
  3. CONTEXT (Target audience, constraints, background info, etc.)
  4. FORMAT (Email, Code, Essay, Table, etc.)
  5. TONE (Professional, Friendly, Academic, etc.)

  DYNAMIC BEHAVIOR RULES:
  - Do not ask for everything at once. Keep it conversational.
  - Contextual Suggestions: When asking for a variable, suggest options based on previous answers. 
    - Example: If Goal is "Write a Python script", suggested Roles could be "Senior Developer" or "Data Scientist".
  - State Tracking: If the user hasn't provided a Goal yet, start there. If they provided Goal and Role, ask for Context next.
  - If the user gives a vague answer, ask a clarifying question.
  
  CURRENT STATE CHECK:
  - Review the conversation history, identify which of the 5 variables are missing, and ask for the most important missing one.
  - Once the user has provided all 5 variables, please prompt them to click the generate plan button. Do not generate anything yourself.
`;

const ARCHITECT_PROMPT = `
You are an expert Prompt Architect.

**Input Context:**
You will be provided with a conversation history between a User and an AI Assistant.

**Your Goal:**
Synthesize this conversation into a single, high-performance "System Instruction" (Meta-Prompt) that the user can use to instruct a new AI instance.

**Guidelines for the Meta-Prompt:**
1. **Voice:** Write the prompt in the **first person**, as if the *User* is speaking directly to the new AI (e.g., "Act as...", "I need you to...").
2. **Synthesis:** Do NOT just list "Role: X, Goal: Y". Instead, weave the Role, Goal, Context, and Tone into a seamless, cohesive narrative instruction.
3. **Inference:** If specific details (like Tone or Format) were not explicitly stated in the history, infer the most professional and logical choice based on the user's goal.
4. **Chain of Thought:** You MUST explicitly instruct the new AI to "Think Step-by-Step" or use "Chain-of-Thought" for all its responses. This instruction should be prominent and integral to the prompt.

**Output Format:**
Return ONLY the final System Instruction text. Do not provide preamble, analysis, or conversational filler.
`;

// onCall listens for HTTP requests from the React app, unwraps it, checks if the user is logged in, parses the JSON, handles CORS and hands us the data.
export const generateResponse = onCall(
  {
    secrets: ["GEMINI_API_KEY"],
  },
  async (request) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const aiProvider = new GeminiProvider(apiKey || ""); // initialise provider
    const data = request.data as ChatRequest; // extract the data from the request which was sent from our frontend

    // safety check
    if (!data.history || data.history.length === 0) {
      throw new HttpsError('invalid-argument', 'History is required');
    }

    // determine system instruction based on the phase
    const phase = data.phase || 'discovery';
    let systemInstruction = '';

    switch (phase) {
      case 'discovery':
        systemInstruction = DISCOVERY_PROMPT;
        break;

      case 'review':
        systemInstruction = ARCHITECT_PROMPT;
        break;

      case 'execution':
        // backend is stateless so it does not remember the plan we just generated
        // we require the frontend to have sent us the plan in order to facilitate execution phase
        if (!data.customPlan) {
          throw new HttpsError('invalid-argument', 'Custom Plan is required for execution phase.');
        }
        // in the execution stage, the user does not need the discovery or architect prompt as the generated plan is the system instruction
        systemInstruction = data.customPlan;
        break;

      default:
        // fallback
        systemInstruction = DISCOVERY_PROMPT;
    }

    logger.info(`Generating response in ${phase} phase`);

    // message to send to the API
    const messages: Message[] = [
      { role: 'system', content: systemInstruction },
      ...data.history
    ];

    try {
      // send the data to the AI provider and get the response
      const response = await aiProvider.generateResponse(messages);
      
      return {
        content: response.content,
        type: phase === 'review' ? 'plan' : 'text'
      };

    } catch (error) {
      logger.error("AI Generation Failed:", error);
      throw new HttpsError('internal', 'Failed to generate response');
    }
  }
);

