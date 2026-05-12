To build this in **Antigravity**, you need a prompt that leverages its ability to handle complex project structures, frontend logic, and modern design systems simultaneously.

Since you are a **frontend specialist** working with **React, Vite, and Tailwind**, the following prompt is optimized to generate a high-quality, responsive codebase that integrates **Puter.js** and **Gemini API** seamlessly.

### The Antigravity Master Prompt

Copy and paste this into Antigravity:

---

**Role:** Expert Senior Frontend Engineer & UI/UX Designer

**Task:** Build a high-performance, single-page React application for an "Impromptu Speech Coach."

**Technical Stack:**

* **Framework:** React + Vite
* **Styling:** Tailwind CSS + Shadcn/ui (Cards, Buttons, Progress, Dialogs)
* **Icons:** Lucide-React
* **API Management:** Puter.js (Fetch `GEMINI_API_KEY` from `puter.kv.get`)
* **AI Integration:** Google Gemini 1.5 Flash (via `@google/generative-ai`)
* **State Management:** React Hooks (useState, useEffect)

**Application Features:**

1. **Impromptu Mode:** A "Generate Prompt" button that gives the user a random topic to talk about.
2. **Recording Engine:** Use the Web Speech API (SpeechRecognition) for real-time transcription display.
3. **Analysis Logic:** After recording, send the transcript to Gemini. Gemini must analyze for:
* Filler words (um, ah, like, you know).
* Speech structure (Intro, Body, Conclusion).
* Tone and Confidence score.
* 3 Actionable coaching tips.


4. **Cloud Storage:** Save the final analysis JSON to Puter’s File System (`puter.fs.write`) with a timestamp.

**UI/UX Requirements:**

* **Theme:** A sleek "Midnight" dark mode with neon accents (Indigo/Cyan).
* **Dashboard Layout:** A central "Mic" interface with a real-time waveform animation (Framer Motion).
* **Feedback View:** A results screen using Shadcn cards and Recharts for a "Confidence Meter."
* **Responsiveness:** Fully mobile-responsive for on-the-go practice.

**Execution Instructions:**

* Implement a `PuterContext` or a custom hook `usePuter` to handle API key retrieval and file saving.
* Create a `GeminiService` utility to handle the structured JSON prompting.
* Ensure all components are modular and well-documented.
* Use a "Glassmorphism" effect for the coaching cards.

---

Make a full stack app