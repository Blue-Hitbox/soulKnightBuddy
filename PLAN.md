# 🤖 AI Buddy System Design Plan

## Soul Knight Assist

> **Target Game:** Soul Knight  
> **Purpose:** Real-time AI co-pilot for gameplay assistance

---

### 📋 Overview

This plan describes a **real-time "AI co-pilot" system** that:

- 📸 **Reads** the game screen
- 🎯 **Understands** enemies & bullets
- 🧮 **Computes** safe movement & targeting
- 🎮 **Optionally sends** light control inputs

---

## 🧠 1. System Overview

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
```

---

## 📡 2. Capture Layer (Real-Time Input)

### 🎯 Goal
Get low-latency game frames from phone.

### 🛠️ Recommended Tool
- **scrcpy** - Screen copy

### ⚙️ Setup
```bash
scrcpy --max-size 800 --bit-rate 8M --max-fps 60
```

### ❓ Why scrcpy?

| Advantage | Description |
|-----------|-------------|
| 🚀 Performance | 30–60 FPS possible |
| ⚡ Latency | Very low latency |
| 🔧 Simplicity | Easier than raw ADB screenshots |

### 📤 Output
- 📹 Live video stream of gameplay

---

## 👁️ 3. Vision Layer (Game Understanding)

### 🎯 Goal
Convert **pixels** → **structured game state**

---

### 🏗️ Phase 1 (Recommended): Rule-based Vision

#### 🔧 Techniques

- 🎨 Color detection (bullets)
- 🔍 Contour detection (enemies)
- 📍 Position estimation

#### 📊 Output Model

```ts
type GameState = {
  player: { x: number; y: number },
  enemies: { x: number; y: number }[],
  bullets: { x: number; y: number }[]
}
```

---

### 🤖 Phase 2 (Upgrade): ML Detection

Later replace vision with:

- 🎯 YOLO object detection
- 🧠 TensorFlow / PyTorch model

---

## 🧠 4. AI Buddy Brain (Core Logic)

### 🎯 Goal
Decide:

- 🚶 Where to move
- 🔫 What to shoot
- ⚠️ When to avoid danger

---

### A. 🗺️ Danger Map System

Each bullet creates a **"danger zone"**.

**Concept:**

- 🔴 Closer bullet = higher risk
- 🔴🔴 Overlapping zones = extreme danger

---

### B. 🚶 Movement Logic

```ts
function getSafeDirection(state: GameState) {
  // move away from bullets
  // prefer open space
  return safestVector;
}
```

**Behavior:**

- ⚠️ Avoid projectiles
- 🏃 Escape crowded areas
- 📏 Maintain distance from threats

---

### C. 🎯 Targeting Logic

**Rules:**

- 🎯 Prioritize nearest enemy
- ⚠️ Or most dangerous enemy
- 💀 Or weakest enemy (optional mode)

---

### D. 🎮 Buddy Modes

| Mode | Behavior | Emoji |
|------|----------|-------|
| 🛡️ Defensive | Survival-first | ❤️ Priority |
| ⚖️ Balanced | Default | 🎯 Standard |
| ⚔️ Aggressive | Attack-focused | 💥 Offensive |

---

## 🖥️ 5. Output Layer

### Option A — Overlay on pc (Recommended) 🌟

**Show:**

- 🟥 Enemy boxes
- 🔴 Bullet highlights
- ➡️ Safe movement arrow

| Pros | Status |
|------|--------|
| Safe (no gameplay interference) | ✅ |
| Best for learning + debugging | ✅ |

---

### Option B — Light Control (ADB Assist) 🎮

**Use only minimal automation:**

```bash
adb shell input swipe x1 y1 x2 y2
adb shell input tap x y
```

**Rules:**

- ⚠️ Only trigger in high danger
- ❌ Never full automation
- 🎮 Keep player in control

---

## ⚙️ 6. Performance Design

### 🔄 Frame Pipeline

```
Capture → Resize → Process → Decision → Output
```

---

### 📐 Recommended Settings

| Setting | Value |
|---------|-------|
| 📺 Resolution | 320×180 or 640×360 |
| 🎬 Processing FPS | 20–30 |
| ⏭️ Frame Skip | If overloaded |

---

### ⚡ Optimization Rules

| Rule | Status |
|------|--------|
| 🖼️ Crop gameplay area only | ✅ |
| 📉 Avoid full-resolution processing | ✅ |
| ➕ Use simple math before ML | ✅ |
| ⏭️ Process every 2nd frame if needed | ✅ |

---

## 🧪 7. Build Phases

### 📍 Phase 1 — Capture System
- ✅ scrcpy working
- ✅ Live frame display in OpenCV

### 🔍 Phase 2 — Vision
- 👤 Detect player
- 🔴 Detect bullets
- 👾 Detect enemies

### 🏗️ Phase 3 — Game State Builder
- 🔄 Convert vision → structured data

### 🧠 Phase 4 — AI Buddy Brain
- 🚶 Safe movement system
- 🎯 Targeting logic

### 🖥️ Phase 5 — Overlay System
- ⚠️ Draw warnings + suggestions

### 🎮 Phase 6 — Optional Control
- 🕹️ ADB movement assist
- 🚨 Emergency dodge logic

### 🤖 Phase 7 — ML Upgrade (Optional)
- 🧠 Replace vision system with ML model
- 📈 Improve detection accuracy

---

## 🚨 Important Design Principles

### ❌ This System Should NOT Be:

| Anti-Pattern | Status |
|--------------|--------|
| 🤖 Full automation bot | ❌ |
| 🎯 Perfect AI player | ❌ |
| 💥 Game-breaking exploit | ❌ |

### ✅ It SHOULD Be:

| Feature | Status |
|---------|--------|
| 🤝 Assistive co-pilot | ✅ |
| 📊 Visual + decision helper | ✅ |
| 🪶 Lightweight control system | ✅ |

---

## 🧩 Final Architecture

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
