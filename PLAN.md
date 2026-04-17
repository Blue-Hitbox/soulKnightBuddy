```md
# 🤖 AI Buddy System Design Plan (Soul Knight Assist)

Target game: *:contentReference[oaicite:0]{index=0}*

This plan describes a **real-time “AI co-pilot” system** that:
- reads the game screen
- understands enemies + bullets
- computes safe movement / targeting
- optionally sends light control inputs

---

# 🧠 1. System Overview

```

Android Phone (Game)
│
│  scrcpy / ADB stream
▼
Capture Layer (PC)
│
▼
Vision Layer (OpenCV / ML)
│
▼
AI Buddy Brain (decision system)
│
├── Overlay (visual hints)
└── Optional ADB input (assist mode)

````

---

# 📡 2. Capture Layer (Real-Time Input)

## Goal
Get low-latency game frames from phone.

## Recommended Tool
- :contentReference[oaicite:1]{index=1}

## Setup
```bash
scrcpy --max-size 800 --bit-rate 8M --max-fps 60
````

## Why scrcpy?

* 30–60 FPS possible
* very low latency
* easier than raw ADB screenshots

## Output

* live video stream of gameplay

---

# 👁️ 3. Vision Layer (Game Understanding)

## Goal

Convert pixels → structured game state

---

## Phase 1 (Recommended): Rule-based vision

### Techniques

* color detection (bullets)
* contour detection (enemies)
* position estimation

### Output model

```ts
type GameState = {
  player: { x: number; y: number },
  enemies: { x: number; y: number }[],
  bullets: { x: number; y: number }[]
}
```

---

## Phase 2 (Upgrade): ML detection

Later replace vision with:

* YOLO object detection
* TensorFlow / PyTorch model

---

# 🧠 4. AI Buddy Brain (Core Logic)

## Goal

Decide:

* where to move
* what to shoot
* when to avoid danger

---

## A. Danger Map System

Each bullet creates a “danger zone”.

Concept:

* closer bullet = higher risk
* overlapping zones = extreme danger

---

## B. Movement Logic

```ts
function getSafeDirection(state: GameState) {
  // move away from bullets
  // prefer open space
  return safestVector;
}
```

Behavior:

* avoid projectiles
* escape crowded areas
* maintain distance from threats

---

## C. Targeting Logic

Rules:

* prioritize nearest enemy
* or most dangerous enemy
* or weakest enemy (optional mode)

---

## D. Buddy Modes

| Mode       | Behavior       |
| ---------- | -------------- |
| Defensive  | survival-first |
| Balanced   | default        |
| Aggressive | attack-focused |

---

# 🖥️ 5. Output Layer

## Option A — Overlay (Recommended)

Show:

* enemy boxes
* bullet highlights
* safe movement arrow

✔ Safe (no gameplay interference)
✔ Best for learning + debugging

---

## Option B — Light Control (ADB assist)

Use only minimal automation:

```bash
adb shell input swipe x1 y1 x2 y2
adb shell input tap x y
```

Rules:

* only trigger in high danger
* never full automation
* keep player in control

---

# ⚙️ 6. Performance Design

## Frame Pipeline

```
Capture → Resize → Process → Decision → Output
```

---

## Recommended Settings

* resolution: 320×180 or 640×360
* processing FPS: 20–30
* skip frames if overloaded

---

## Optimization Rules

✔ crop gameplay area only
✔ avoid full-resolution processing
✔ use simple math before ML
✔ process every 2nd frame if needed

---

# 🧪 7. Build Phases

---

## Phase 1 — Capture System

* scrcpy working
* live frame display in OpenCV

---

## Phase 2 — Vision

* detect player
* detect bullets
* detect enemies

---

## Phase 3 — Game State Builder

* convert vision → structured data

---

## Phase 4 — AI Buddy Brain

* safe movement system
* targeting logic

---

## Phase 5 — Overlay System

* draw warnings + suggestions

---

## Phase 6 — Optional Control

* ADB movement assist
* emergency dodge logic

---

## Phase 7 — ML Upgrade (Optional)

* replace vision system with ML model
* improve detection accuracy

---

# 🚨 Important Design Principle

This system should NOT be:

* full automation bot ❌
* perfect AI player ❌
* game-breaking exploit ❌

It SHOULD be:

* assistive co-pilot ✔
* visual + decision helper ✔
* lightweight control system ✔

---

# 🧩 Final Architecture

```
scrcpy (video stream)
        ↓
OpenCV frame processing
        ↓
Game state extraction
        ↓
AI buddy decision engine
        ↓
Overlay + optional ADB assist
```

---

# 🚀 If you want next step

I can help you build:

* 🧱 Phase 1 (working scrcpy + frame loop)
* 🎯 Bullet detection system
* 🧠 AI buddy decision engine (code)
* 📊 full working prototype structure (TypeScript + Python)

Just tell me 👍

```
```
