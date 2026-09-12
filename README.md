# 🧥 MorphoMix: Real-Time AI Personal Stylist

> **MorphoMix** is an AI-powered styling dashboard built for a high-paced hackathon. It bridges the gap between digital moodboards and your physical wardrobe by analyzing your live video feed to deliver instant, personalized outfit recommendations.

---

## 👁️ The Vision & The Problem
* **The Problem:** We save amazing outfits and aesthetic inspirations on digital moodboards, but when we stand in front of our mirrors with our actual clothes, figuring out how to style them to match that vibe is a guessing game.
* **The Solution:** MorphoMix uses computer vision and generative AI to look at you, your target moodboard, and your digital wardrobe simultaneously. It instantly selects the best matching items from your closet and tells you *how* to style them.

---

## 🛠️ Tech Stack & Architecture

MorphoMix is built on a lightweight, high-performance micro-architecture:
* **Front-End:** React.js (Vite) & Tailwind CSS for a modern, responsive UI.
* **Video Feed:** Vonage Video API for seamless, real-time web camera integration.
* **AI Middleware:** Stitch as the low-code router handling secure API communication.
* **The Brain:** Google AI Studio (Gemini Vision) to analyze multi-modal payloads (webcam frames + moodboards + JSON wardrobe).
* **Data Layer:** A localized, hardcoded `dressing.json` dataset for zero-latency wardrobe tracking.

---

## ✨ Key Functionalities

1. **Live Camera Mirroring:** Integrates the Vonage Video SDK directly into the dashboard to stream your live physical environment.
2. **Instant Visual Capture:** A custom HTML5 `<canvas>` snapshot utility (`captureFrame`) that converts the live video feed into a secure Base64 payload on a single click.
3. **Digital Wardrobe Gallery:** Displays your curated clothing inventory in real-time. Items chosen by the AI automatically glow and highlight themselves.
4. **Contextual AI Styling Advice:** Generates an immediate, one-sentence actionable styling tip (e.g., *"Tuck the shirt into the baggy jeans to define your waist"*).

---

## 🚀 Getting Started (Installation)

Follow these steps to run the project locally:

### 1. Clone the repository
```bash
git clone [https://github.com/stellambousnoum005-creator/AI-Fashion-hackaton.git](https://github.com/stellambousnoum005-creator/AI-Fashion-hackaton.git)
cd AI-Fashion-hackaton
