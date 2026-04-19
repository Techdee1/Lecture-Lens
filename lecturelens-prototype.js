const TRANSCRIPT = [
  { time: "00:00:05", text: "Today we are studying PN junctions." },
  { time: "00:02:15", text: "This creates the depletion region." },
  { time: "00:05:42", text: "Next is built-in potential, called V-bi." },
  { time: "00:09:18", text: "Forward bias lowers the barrier and current rises." },
  { time: "00:12:05", text: "Reverse bias widens depletion and blocks current." }
];

const CONCEPTS = [
  {
    concept: "Depletion Region",
    timestamp: "00:02:15",
    explanation: "Carrier diffusion leaves fixed ions, creating a field at the junction."
  },
  {
    concept: "Built-in Potential",
    timestamp: "00:05:42",
    explanation: "An equilibrium voltage forms naturally across the PN junction."
  },
  {
    concept: "Forward Bias",
    timestamp: "00:09:18",
    explanation: "Applying positive bias lowers the barrier and current increases rapidly."
  },
  {
    concept: "Reverse Bias",
    timestamp: "00:12:05",
    explanation: "Applying reverse bias raises the barrier and only tiny leakage current flows."
  }
];

const CONCEPT_REVEAL_INTERVAL_SECONDS = 6;
const TICK_INTERVAL_SECONDS = 2;
const TICK_INTERVAL_MS = TICK_INTERVAL_SECONDS * 1000;

const state = {
  running: false,
  currentLine: -1,
  visibleConcepts: [],
  seconds: 0,
  timerId: null,
};

function formatHMS(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function render() {
  const app = document.getElementById("app");
  const transcriptHtml = TRANSCRIPT.map((line, i) => `
    <div class="line ${i === state.currentLine ? "active" : ""}">
      <span class="time">${line.time}</span>${line.text}
    </div>
  `).join("");

  const conceptsHtml = state.visibleConcepts.length
    ? state.visibleConcepts.map((c, i) => `
      <article class="concept concept--${(i % 4) + 1}">
        <h4><span class="concept-badge">💡</span>${c.concept} <small style="color:#9fb0d6;font-weight:500">(${c.timestamp})</small></h4>
        <p>${c.explanation}</p>
      </article>
    `).join("")
    : `<div style="color:#8ea1c7;padding:12px;border:1px dashed #355078;border-radius:10px;background:rgba(15,23,42,.35)">🎧 Listening for concepts…</div>`;

  app.innerHTML = `
    <section class="card">
      <header class="topbar">
        <div><span class="brand">🎓 Lecture Lens</span> — Polished simple prototype</div>
        <div class="status-chip">${state.running ? "🟢 LIVE" : "🟡 STANDBY"} • ${formatHMS(state.seconds)} • ${state.visibleConcepts.length} concepts</div>
      </header>
      <div class="grid">
        <div class="panel">
          <h3 class="section-title"><span class="section-icon">📝</span>Live Transcript</h3>
          <div class="transcript">${transcriptHtml}</div>
        </div>
        <div class="panel">
          <h3 class="section-title"><span class="section-icon">✨</span>Detected Concepts</h3>
          <div class="concepts">${conceptsHtml}</div>
        </div>
      </div>
      <footer class="actions">
        <button id="startBtn" class="primary">▶️ Start Demo</button>
        <button id="stopBtn" class="danger">⏹ Stop</button>
      </footer>
    </section>
  `;

  document.getElementById("startBtn").onclick = startDemo;
  document.getElementById("stopBtn").onclick = stopDemo;
}

function stopDemo() {
  state.running = false;
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  render();
}

function startDemo() {
  if (state.running) return;
  state.running = true;
  state.currentLine = -1;
  state.visibleConcepts = [];
  state.seconds = 0;

  let transcriptIndex = 0;
  let conceptIndex = 0;

  state.timerId = setInterval(() => {
    if (!state.running) return;

    state.seconds += TICK_INTERVAL_SECONDS;

    if (transcriptIndex < TRANSCRIPT.length) {
      state.currentLine = transcriptIndex;
      transcriptIndex += 1;
    }

    if (
      conceptIndex < CONCEPTS.length &&
      state.seconds >= (conceptIndex + 1) * CONCEPT_REVEAL_INTERVAL_SECONDS
    ) {
      state.visibleConcepts = [CONCEPTS[conceptIndex], ...state.visibleConcepts];
      conceptIndex += 1;
    }

    if (transcriptIndex >= TRANSCRIPT.length && conceptIndex >= CONCEPTS.length) {
      stopDemo();
      return;
    }

    render();
  }, TICK_INTERVAL_MS);

  render();
}

render();
