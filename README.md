# Guided AI Prompting Interface

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A web application featuring a guided, four-phase scaffolded architecture to facilitate effective AI prompting. 

📄 **[Read the Full 47-Page CS310 Technical Report](YOUR_LINK_HERE)**

---

## 🚨 The Problem
Standard interfaces for generative AI models result in users without prompt engineering knowledge recieving subpar AI responses. The quality of the AI response depends on the quality of the user's prompt. Yet, users are presented with the "blank page problem", offering no assistance. This induces high cognitive load for novice users and necessitates manual, cumbersome workflows for experienced users.

## 💡 The Solution
This application introduces a deterministic, state-driven intermediary layer. It uses a step-by-step scaffolding architecture to assist the user in prompt creation, reducing extraneous cognitive load, and achieving high-quality AI responses through expertly crafted meta-prompts.

---

## 🏗️ System Architecture & Tech Stack

* **Frontend (Presentation Tier):** Built with React and Zustand. Utilises an optimistic UI design pattern and a mathematically rigorous semantic design system powered by Tailwind CSS and the OKLCH colour space.
* **State Management:** A centralised Zustand store guarantees a strict unidirectional data flow, ensuring deterministic phase management.
* **Backend/Middleware (Serverless Tier):** A Backend-for-Frontend (BFF) middleware pattern implemented using Firebase Cloud Functions. This acts as a state-aware router to dynamically inject specialised system instructions without compromising client-side security.
* **Database Layer:** A two-layered NoSQL Firestore database schema. Utilises persistent real-time listeners for data synchronization between the UI and backend.
* **AI Integration:** Integrated with Google Gemini via a custom Adapter pattern, abstracting provider-specific SDK logic to prevent vendor lock-in.

---

## ⚙️ The 4-Phase Core Engine

![Four-Phase Scaffolded User Journey](link_to_your_architecture_diagram.png)

**1. Discovery (Extracting Context)**
Systematically extracts five key components from the user: the goal, role, context, format, and tone. 

**2. Blueprint (Generating the Expert Prompt)**
Dynamically constructs and orchestrates an expert-level meta-prompt. The LLM acts as an expert prompt architect, synthesizing the constraints. Prior chat history is deliberately discarded at this stage to prevent context rot and optimise token efficiency.

**3. Refinement (Iterative Loop)**
Users can edit the generated blueprint before execution. This phase implements semantic routing and a custom regex parsing pipeline to reliably extract structured JSON from raw LLM outputs.

**4. Execution (Finalizing Output)**
The approved blueprint is executed using a hidden trigger message. The user receives the highly curated final output and can continue the conversation normally.

---

## 📊 Evaluation & Impact

Rigorous quantitative and qualitative UAT evaluations demonstrate that this approach significantly lowers cognitive load, improves context fidelity, and generates highly actionable outputs.

* **Output Efficacy Index (OEI) - 6.5 / 7:** Participants strongly agreed the generated outputs were highly actionable and immediately usable without needing follow-up prompts.
* **Context Fidelity Score (CFS) - 6.5 / 7:** Demonstrated the successful extraction and integration of user constraints, proving the Discovery phase functions as an effective data-gathering mechanism.
* **Single Ease Question (SEQ) - 6.75 / 7:** A near-perfect score proving the step-by-step architectural design successfully minimises perceived task complexity and cognitive load[cite: 800, 801].
