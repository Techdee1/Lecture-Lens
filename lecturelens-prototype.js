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
    ? state.visibleConcepts.map(c => `
      <article class="concept">
        <h4>${c.concept} <small style="color:#6b7280;font-weight:500">(${c.timestamp})</small></h4>
        <p>${c.explanation}</p>
      </article>
    `).join("")
    : `<div style="color:#4b5563;padding:12px;border:1px dashed #1f2937;border-radius:10px">Listening for concepts…</div>`;

  app.innerHTML = `
    <section class="card">
      <header class="topbar">
        <div><span class="brand">🎓 Lecture Lens</span> — Simple deployable frontend prototype</div>
        <div>${state.running ? "LIVE" : "STANDBY"} • ${formatHMS(state.seconds)} • ${state.visibleConcepts.length} concepts</div>
      </header>
      <div class="grid">
        <div class="panel">
          <h3 class="subtitle">Live Transcript</h3>
          <div class="transcript">${transcriptHtml}</div>
        </div>
        <div class="panel">
          <h3 class="subtitle">Detected Concepts</h3>
          <div class="concepts">${conceptsHtml}</div>
        </div>
      </div>
      <footer class="actions">
        <button id="startBtn" class="primary">Start Demo</button>
        <button id="stopBtn" class="danger">Stop</button>
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

    state.seconds += 2;

    if (transcriptIndex < TRANSCRIPT.length) {
      state.currentLine = transcriptIndex;
      transcriptIndex += 1;
    }

    if (conceptIndex < CONCEPTS.length && state.seconds >= (conceptIndex + 1) * 6) {
      state.visibleConcepts = [CONCEPTS[conceptIndex], ...state.visibleConcepts];
      conceptIndex += 1;
    }

    if (transcriptIndex >= TRANSCRIPT.length && conceptIndex >= CONCEPTS.length) {
      stopDemo();
      return;
    }

    render();
  }, 2000);

  render();
}

render();
