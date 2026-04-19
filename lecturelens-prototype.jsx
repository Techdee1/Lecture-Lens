import { useState, useEffect, useRef, useCallback } from "react";

// Simulated event data for demo
const DEMO_CONCEPTS = [
  {
    concept_id: "c1",
    timestamp: "00:02:15",
    concept: "Depletion Region",
    concept_type: "relationship",
    visual: {
      type: "mermaid",
      description: "PN Junction structure showing the depletion zone where mobile carriers have diffused away"
    },
    enrichment: {
      explanation: "The area in a PN junction where mobile carriers (electrons and holes) have diffused across, leaving behind fixed ions. This creates an electric field that opposes further diffusion.",
      formula: "W = \\sqrt{\\frac{2\\varepsilon_s(V_{bi} - V_A)}{q} \\left(\\frac{N_A + N_D}{N_A N_D}\\right)}",
      related: ["Built-in Potential", "Reverse Bias", "Forward Bias"]
    }
  },
  {
    concept_id: "c2",
    timestamp: "00:05:42",
    concept: "Built-in Potential",
    concept_type: "formula",
    visual: {
      type: "chart",
      description: "Energy band diagram showing the potential barrier at the PN junction"
    },
    enrichment: {
      explanation: "The voltage that naturally forms across a PN junction at equilibrium due to carrier diffusion. It prevents further net movement of charge carriers across the junction.",
      formula: "V_{bi} = \\frac{kT}{q} \\ln\\left(\\frac{N_A N_D}{n_i^2}\\right)",
      related: ["Depletion Region", "Thermal Voltage", "Carrier Concentration"]
    }
  },
  {
    concept_id: "c3",
    timestamp: "00:09:18",
    concept: "Forward Bias",
    concept_type: "comparison",
    visual: {
      type: "comparison",
      description: "Comparison of forward vs reverse bias behavior"
    },
    enrichment: {
      explanation: "When external voltage is applied to reduce the built-in potential barrier, allowing majority carriers to cross the junction. Current increases exponentially with applied voltage.",
      formula: "I = I_s\\left(e^{V_A/V_T} - 1\\right)",
      related: ["Reverse Bias", "Diode Equation", "Threshold Voltage"]
    }
  },
  {
    concept_id: "c4",
    timestamp: "00:12:05",
    concept: "Reverse Bias",
    concept_type: "waveform",
    visual: {
      type: "plot",
      description: "I-V characteristic curve showing the reverse bias region"
    },
    enrichment: {
      explanation: "When external voltage increases the potential barrier, widening the depletion region. Only a tiny reverse saturation current flows due to minority carriers.",
      formula: "I \\approx -I_s \\quad \\text{for } V_A \\ll -V_T",
      related: ["Breakdown Voltage", "Zener Effect", "Avalanche Breakdown"]
    }
  }
];

const DEMO_TRANSCRIPT_LINES = [
  { time: "00:00:05", text: "Good morning everyone. Today we're going to continue our discussion on semiconductor devices." },
  { time: "00:00:18", text: "Specifically, we'll be looking at the PN junction in much more detail than last week." },
  { time: "00:01:30", text: "Now, when you bring P-type and N-type materials together, something very interesting happens at the interface." },
  { time: "00:02:00", text: "The electrons from the N-side diffuse across to the P-side, and holes go the other way." },
  { time: "00:02:15", text: "This creates what we call the depletion region — an area where there are no free carriers." },
  { time: "00:03:00", text: "The fixed ions left behind create an electric field that opposes further diffusion." },
  { time: "00:04:10", text: "Think of it like two groups of people meeting at a border — they exchange, and a neutral zone forms." },
  { time: "00:05:00", text: "Now this electric field corresponds to a potential difference across the junction." },
  { time: "00:05:42", text: "We call this the built-in potential, V-bi. It depends on the doping concentrations." },
  { time: "00:06:30", text: "For silicon at room temperature, this is typically around 0.7 volts." },
  { time: "00:07:45", text: "The thermal voltage kT over q at room temperature is about 26 millivolts." },
  { time: "00:08:30", text: "Now, what happens when we apply an external voltage to this junction?" },
  { time: "00:09:18", text: "If we apply positive voltage to the P-side, we call this forward bias." },
  { time: "00:10:00", text: "Forward bias reduces the barrier, allowing current to flow exponentially." },
  { time: "00:11:15", text: "This gives us the famous diode equation: I equals I-s times e to the V over V-T minus one." },
  { time: "00:12:05", text: "Reverse bias is the opposite — it increases the barrier and widens the depletion region." },
  { time: "00:13:00", text: "In reverse bias, only a very small saturation current flows, typically in nanoamps or picoamps." },
];

// Mermaid-style concept map as SVG
function ConceptMap({ concepts }) {
  const detected = concepts.map(c => c.concept);
  const nodes = [
    { id: "pn", label: "PN Junction", x: 300, y: 40, root: true },
    { id: "dr", label: "Depletion\nRegion", x: 140, y: 130 },
    { id: "bp", label: "Built-in\nPotential", x: 460, y: 130 },
    { id: "fb", label: "Forward\nBias", x: 80, y: 240 },
    { id: "rb", label: "Reverse\nBias", x: 220, y: 240 },
    { id: "tv", label: "Thermal\nVoltage", x: 380, y: 240 },
    { id: "cc", label: "Carrier\nConcentration", x: 530, y: 240 },
  ];
  const edges = [
    ["pn","dr"], ["pn","bp"], ["dr","fb"], ["dr","rb"], ["bp","tv"], ["bp","cc"]
  ];
  const conceptMap = {
    "Depletion Region": "dr",
    "Built-in Potential": "bp",
    "Forward Bias": "fb",
    "Reverse Bias": "rb",
  };

  const activeIds = new Set(["pn"]);
  detected.forEach(c => { if(conceptMap[c]) activeIds.add(conceptMap[c]); });

  return (
    <svg viewBox="0 0 620 300" style={{ width: "100%", height: "100%" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {edges.map(([from, to], i) => {
        const a = nodes.find(n=>n.id===from);
        const b = nodes.find(n=>n.id===to);
        const active = activeIds.has(from) && activeIds.has(to);
        return (
          <line key={i} x1={a.x} y1={a.y+18} x2={b.x} y2={b.y-18}
            stroke={active ? "#6ee7b7" : "#334155"} strokeWidth={active ? 2 : 1}
            strokeDasharray={active ? "none" : "4 4"} opacity={active ? 1 : 0.4}
          />
        );
      })}
      {nodes.map(n => {
        const active = activeIds.has(n.id);
        const lines = n.label.split("\n");
        return (
          <g key={n.id} filter={active ? "url(#glow)" : undefined}
            style={{ transition: "all 0.5s ease" }}>
            <rect x={n.x - 55} y={n.y - 18} width={110} height={lines.length > 1 ? 42 : 36}
              rx={8}
              fill={n.root ? "#065f46" : active ? "#064e3b" : "#1e293b"}
              stroke={active ? "#6ee7b7" : "#475569"} strokeWidth={active ? 2 : 1}
            />
            {lines.map((line, i) => (
              <text key={i} x={n.x} y={n.y + (i * 16) - (lines.length > 1 ? 2 : 0)}
                textAnchor="middle" dominantBaseline="middle"
                fill={active ? "#ecfdf5" : "#94a3b8"}
                fontSize={11} fontFamily="'JetBrains Mono', monospace" fontWeight={active ? 600 : 400}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// Visual card based on concept type
function VisualRenderer({ concept }) {
  const { visual, enrichment, concept: name } = concept;

  if (visual.type === "comparison") {
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
        padding: "12px", background: "#0f172a", borderRadius: "8px", fontSize: "12px"
      }}>
        <div style={{ padding: "10px", background: "#064e3b", borderRadius: "6px" }}>
          <div style={{ color: "#6ee7b7", fontWeight: 700, marginBottom: "6px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Forward Bias</div>
          <div style={{ color: "#d1d5db", lineHeight: 1.5 }}>
            <div>• Reduces barrier</div>
            <div>• Current flows</div>
            <div>• V_A {">"} 0</div>
            <div>• Exponential I-V</div>
          </div>
        </div>
        <div style={{ padding: "10px", background: "#1e1b4b", borderRadius: "6px" }}>
          <div style={{ color: "#a5b4fc", fontWeight: 700, marginBottom: "6px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reverse Bias</div>
          <div style={{ color: "#d1d5db", lineHeight: 1.5 }}>
            <div>• Increases barrier</div>
            <div>• Tiny I_s flows</div>
            <div>• V_A {"<"} 0</div>
            <div>• Nearly flat I-V</div>
          </div>
        </div>
      </div>
    );
  }

  if (visual.type === "plot") {
    // I-V curve approximation
    const points = [];
    for (let v = -3; v <= 0.8; v += 0.05) {
      const i = v < -2.5 ? -15 : v < 0 ? -2 : (Math.exp(v * 10) - 1) * 0.5;
      const clampedI = Math.max(-20, Math.min(80, i));
      points.push({ v, i: clampedI });
    }
    const mapX = v => 40 + ((v + 3) / 3.8) * 260;
    const mapY = i => 140 - (i / 80) * 120;

    return (
      <svg viewBox="0 0 320 170" style={{ width: "100%", background: "#0f172a", borderRadius: "8px" }}>
        {/* Grid */}
        {[-2, -1, 0].map(v => (
          <line key={v} x1={mapX(v)} y1={20} x2={mapX(v)} y2={155} stroke="#1e293b" strokeWidth={1} />
        ))}
        {[0, 20, 40, 60].map(i => (
          <line key={i} x1={35} y1={mapY(i)} x2={305} y2={mapY(i)} stroke="#1e293b" strokeWidth={1} />
        ))}
        {/* Axes */}
        <line x1={mapX(0)} y1={15} x2={mapX(0)} y2={155} stroke="#475569" strokeWidth={1.5} />
        <line x1={35} y1={mapY(0)} x2={305} y2={mapY(0)} stroke="#475569" strokeWidth={1.5} />
        {/* Curve */}
        <polyline
          points={points.map(p => `${mapX(p.v)},${mapY(p.i)}`).join(" ")}
          fill="none" stroke="#f472b6" strokeWidth={2.5}
        />
        {/* Labels */}
        <text x={300} y={mapY(0) - 6} fill="#94a3b8" fontSize={10} textAnchor="end">V</text>
        <text x={mapX(0) + 8} y={22} fill="#94a3b8" fontSize={10}>I</text>
        <text x={mapX(-2)} y={155} fill="#64748b" fontSize={9} textAnchor="middle">-2V</text>
        <text x={mapX(-1)} y={155} fill="#64748b" fontSize={9} textAnchor="middle">-1V</text>
        <text x={mapX(0.7)} y={mapY(0) + 12} fill="#64748b" fontSize={9} textAnchor="middle">0.7V</text>
        {/* Regions */}
        <text x={mapX(-1.5)} y={mapY(0) - 20} fill="#a5b4fc" fontSize={9} textAnchor="middle" opacity={0.7}>Reverse</text>
        <text x={mapX(0.5)} y={mapY(30)} fill="#6ee7b7" fontSize={9} textAnchor="middle" opacity={0.7}>Forward</text>
      </svg>
    );
  }

  if (visual.type === "chart") {
    // Energy band diagram
    return (
      <svg viewBox="0 0 320 150" style={{ width: "100%", background: "#0f172a", borderRadius: "8px" }}>
        {/* P-side band */}
        <line x1={20} y1={40} x2={140} y2={40} stroke="#f472b6" strokeWidth={2} />
        <line x1={20} y1={90} x2={140} y2={90} stroke="#f472b6" strokeWidth={2} />
        {/* N-side band (lower) */}
        <line x1={180} y1={60} x2={300} y2={60} stroke="#60a5fa" strokeWidth={2} />
        <line x1={180} y1={110} x2={300} y2={110} stroke="#60a5fa" strokeWidth={2} />
        {/* Junction transitions */}
        <path d="M 140 40 Q 160 40, 180 60" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d="M 140 90 Q 160 90, 180 110" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" />
        {/* V_bi arrow */}
        <line x1={160} y1={42} x2={160} y2={58} stroke="#fbbf24" strokeWidth={1.5} markerEnd="url(#arrowY)" />
        <defs><marker id="arrowY" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24"/></marker></defs>
        <text x={168} y={54} fill="#fbbf24" fontSize={11} fontWeight={600} fontFamily="'JetBrains Mono', monospace">V_bi</text>
        {/* Labels */}
        <text x={80} y={30} fill="#f472b6" fontSize={11} textAnchor="middle" fontWeight={600}>P-type</text>
        <text x={240} y={50} fill="#60a5fa" fontSize={11} textAnchor="middle" fontWeight={600}>N-type</text>
        <text x={80} y={78} fill="#94a3b8" fontSize={9} textAnchor="middle">E_c</text>
        <text x={80} y={105} fill="#94a3b8" fontSize={9} textAnchor="middle">E_v</text>
        <text x={160} y={135} fill="#64748b" fontSize={10} textAnchor="middle">Depletion Region</text>
        {/* Depletion zone shade */}
        <rect x={130} y={25} width={60} height={115} fill="#6ee7b7" opacity={0.05} rx={4} />
      </svg>
    );
  }

  // Default: Mermaid-style diagram placeholder
  return (
    <div style={{
      padding: "16px", background: "#0f172a", borderRadius: "8px",
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100px", border: "1px solid #1e293b"
    }}>
      <ConceptMap concepts={[concept]} />
    </div>
  );
}

// Formula renderer (simplified LaTeX display)
function FormulaDisplay({ formula }) {
  if (!formula) return null;
  return (
    <div style={{
      background: "#0f172a", borderRadius: "6px", padding: "10px 14px",
      fontFamily: "'JetBrains Mono', monospace", fontSize: "13px",
      color: "#e2e8f0", textAlign: "center", border: "1px solid #1e293b",
      letterSpacing: "0.02em", overflowX: "auto"
    }}>
      {formula}
    </div>
  );
}

// Single concept card with progressive loading
function ConceptCard({ concept, isNew }) {
  const [stage, setStage] = useState(0); // 0: name, 1: +visual, 2: +enrichment
  const hasVisual = !!concept.visual;
  const hasEnrichment = !!concept.enrichment;

  useEffect(() => {
    if (isNew) {
      setStage(0);
      const t1 = setTimeout(() => hasVisual && setStage(1), 800);
      const t2 = setTimeout(() => hasEnrichment && setStage(2), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setStage(2);
    }
  }, [concept.concept_id, isNew]);

  return (
    <div style={{
      background: "#111827",
      border: "1px solid #1f2937",
      borderRadius: "12px",
      padding: "0",
      overflow: "hidden",
      animation: isNew ? "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #1f2937",
        background: "#0d1117"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: isNew ? "#6ee7b7" : "#475569",
            boxShadow: isNew ? "0 0 8px #6ee7b7" : "none",
            animation: isNew ? "pulse 2s infinite" : "none"
          }} />
          <span style={{
            color: "#f0fdf4", fontWeight: 700, fontSize: "15px",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.01em"
          }}>
            {concept.concept}
          </span>
        </div>
        <span style={{
          color: "#6b7280", fontSize: "11px",
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          {concept.timestamp}
        </span>
      </div>

      {/* Visual */}
      {stage >= 1 && concept.visual && (
        <div style={{ padding: "12px", animation: "fadeIn 0.5s ease" }}>
          <VisualRenderer concept={concept} />
        </div>
      )}

      {/* Enrichment */}
      {stage >= 2 && concept.enrichment && (
        <div style={{ padding: "0 16px 14px", animation: "fadeIn 0.5s ease" }}>
          <p style={{
            color: "#d1d5db", fontSize: "13px", lineHeight: 1.65,
            margin: "0 0 10px",
            fontFamily: "'IBM Plex Sans', sans-serif"
          }}>
            {concept.enrichment.explanation}
          </p>
          <FormulaDisplay formula={concept.enrichment.formula} />
          {concept.enrichment.related && (
            <div style={{
              display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap"
            }}>
              {concept.enrichment.related.map(r => (
                <span key={r} style={{
                  background: "#1e293b", color: "#94a3b8",
                  padding: "3px 10px", borderRadius: "100px",
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {stage < 2 && isNew && (
        <div style={{
          padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <div style={{
            width: "12px", height: "12px", border: "2px solid #1f2937",
            borderTopColor: "#6ee7b7", borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <span style={{ color: "#6b7280", fontSize: "12px" }}>
            {stage === 0 ? "Generating visual..." : "Building explanation..."}
          </span>
        </div>
      )}
    </div>
  );
}

// Transcript panel
function TranscriptPanel({ lines, currentIndex }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentIndex]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "2px",
      overflowY: "auto", maxHeight: "100%", padding: "12px"
    }}>
      {lines.slice(0, currentIndex + 1).map((line, i) => (
        <div key={i} style={{
          display: "flex", gap: "10px", padding: "6px 8px",
          borderRadius: "6px",
          background: i === currentIndex ? "rgba(110, 231, 183, 0.05)" : "transparent",
          animation: i === currentIndex ? "fadeIn 0.3s ease" : "none"
        }}>
          <span style={{
            color: "#4b5563", fontSize: "11px", flexShrink: 0, width: "52px",
            fontFamily: "'JetBrains Mono', monospace", paddingTop: "2px"
          }}>
            {line.time}
          </span>
          <span style={{
            color: i === currentIndex ? "#e5e7eb" : "#9ca3af",
            fontSize: "13px", lineHeight: 1.6,
            fontFamily: "'IBM Plex Sans', sans-serif"
          }}>
            {line.text}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

// Notes tab
function NotesPanel({ concepts }) {
  if (concepts.length === 0) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", color: "#4b5563", fontSize: "13px",
        fontFamily: "'IBM Plex Sans', sans-serif"
      }}>
        Notes will appear as concepts are detected...
      </div>
    );
  }
  return (
    <div style={{ padding: "16px", overflowY: "auto", maxHeight: "100%" }}>
      <div style={{
        color: "#9ca3af", fontSize: "12px", marginBottom: "16px",
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase", letterSpacing: "0.08em"
      }}>
        Auto-generated • {concepts.length} concepts captured
      </div>
      {concepts.map((c, i) => (
        <div key={c.concept_id} style={{
          marginBottom: "16px", paddingBottom: "16px",
          borderBottom: i < concepts.length - 1 ? "1px solid #1f2937" : "none"
        }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px"
          }}>
            <span style={{
              color: "#6ee7b7", fontWeight: 700, fontSize: "14px",
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              {i + 1}. {c.concept}
            </span>
            <span style={{
              color: "#4b5563", fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              [{c.timestamp}]
            </span>
          </div>
          {c.enrichment && (
            <p style={{
              color: "#d1d5db", fontSize: "13px", lineHeight: 1.6,
              margin: "0 0 6px", paddingLeft: "16px",
              fontFamily: "'IBM Plex Sans', sans-serif"
            }}>
              {c.enrichment.explanation}
            </p>
          )}
          {c.enrichment?.formula && (
            <div style={{ paddingLeft: "16px", marginTop: "6px" }}>
              <FormulaDisplay formula={c.enrichment.formula} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Status bar
function StatusBar({ isRecording, status, conceptCount, elapsed }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 20px",
      background: "#0d1117",
      borderBottom: "1px solid #1f2937",
      fontSize: "12px",
      fontFamily: "'JetBrains Mono', monospace"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: isRecording ? "#ef4444" : "#4b5563",
            animation: isRecording ? "pulse 1.5s infinite" : "none"
          }} />
          <span style={{ color: isRecording ? "#fca5a5" : "#6b7280" }}>
            {isRecording ? "LIVE" : "STANDBY"}
          </span>
        </div>
        <span style={{ color: "#6b7280" }}>
          {elapsed}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ color: "#6b7280" }}>
          {status}
        </span>
        <span style={{ color: "#6ee7b7" }}>
          {conceptCount} concepts
        </span>
      </div>
    </div>
  );
}

// Main App
export default function LectureLens() {
  const [view, setView] = useState("prep"); // "prep" | "live"
  const [isRecording, setIsRecording] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [visibleConcepts, setVisibleConcepts] = useState([]);
  const [newestConceptId, setNewestConceptId] = useState(null);
  const [rightTab, setRightTab] = useState("concepts"); // "concepts" | "map" | "notes"
  const [status, setStatus] = useState("Waiting to start...");
  const [elapsed, setElapsed] = useState("00:00:00");
  const [prepStage, setPrepStage] = useState(0);
  const [prepTopic, setPrepTopic] = useState("");
  const intervalRef = useRef(null);
  const conceptTimers = useRef([]);

  // Prep mode simulation
  const startPrep = () => {
    if (!prepTopic.trim()) return;
    setPrepStage(1);
    setTimeout(() => setPrepStage(2), 1500);
    setTimeout(() => setPrepStage(3), 3500);
    setTimeout(() => setPrepStage(4), 5500);
    setTimeout(() => setPrepStage(5), 7000);
  };

  // Simulate live lecture
  const startLecture = () => {
    setView("live");
    setIsRecording(true);
    setCurrentLine(-1);
    setVisibleConcepts([]);
    setStatus("Listening...");

    let lineIdx = 0;
    let seconds = 0;

    intervalRef.current = setInterval(() => {
      seconds++;
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      setElapsed(`${h}:${m}:${s}`);

      if (lineIdx < DEMO_TRANSCRIPT_LINES.length) {
        setCurrentLine(lineIdx);
        setStatus("Listening...");
        lineIdx++;
      }
    }, 2200);

    // Schedule concept appearances
    const conceptSchedule = [
      { concept: DEMO_CONCEPTS[0], delay: 6600 },
      { concept: DEMO_CONCEPTS[1], delay: 15400 },
      { concept: DEMO_CONCEPTS[2], delay: 24200 },
      { concept: DEMO_CONCEPTS[3], delay: 33000 },
    ];

    conceptSchedule.forEach(({ concept, delay }) => {
      const timer = setTimeout(() => {
        setStatus(`Concept detected: ${concept.concept}`);
        setNewestConceptId(concept.concept_id);
        setVisibleConcepts(prev => [concept, ...prev]);
        setTimeout(() => setStatus("Listening..."), 3000);
      }, delay);
      conceptTimers.current.push(timer);
    });
  };

  const stopLecture = () => {
    setIsRecording(false);
    setStatus("Session ended — notes saved");
    clearInterval(intervalRef.current);
    conceptTimers.current.forEach(clearTimeout);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      conceptTimers.current.forEach(clearTimeout);
    };
  }, []);

  // --- PREP VIEW ---
  if (view === "prep") {
    return (
      <div style={{
        width: "100%", height: "100vh", background: "#090d14",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", fontFamily: "'IBM Plex Sans', sans-serif",
        padding: "20px"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes progressBar { from { width: 0%; } to { width: 100%; } }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
        `}</style>

        <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "10px", marginBottom: "8px"
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #065f46, #6ee7b7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px"
            }}>
              🎓
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: "24px", color: "#f0fdf4",
              letterSpacing: "-0.03em"
            }}>
              LectureLens
            </span>
          </div>
          <p style={{
            color: "#6b7280", fontSize: "14px", marginBottom: "36px",
            fontFamily: "'IBM Plex Sans', sans-serif"
          }}>
            Understand your lectures in real time
          </p>

          {prepStage === 0 && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{
                background: "#111827", borderRadius: "12px", padding: "24px",
                border: "1px solid #1f2937", textAlign: "left"
              }}>
                <label style={{
                  color: "#9ca3af", fontSize: "12px", display: "block",
                  marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.08em"
                }}>
                  What's today's lecture about?
                </label>
                <input
                  type="text"
                  value={prepTopic}
                  onChange={e => setPrepTopic(e.target.value)}
                  placeholder="e.g. PN Junction Diodes — EEG 215"
                  style={{
                    width: "100%", padding: "12px 14px",
                    background: "#0d1117", border: "1px solid #1f2937",
                    borderRadius: "8px", color: "#e5e7eb", fontSize: "14px",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    outline: "none", marginBottom: "16px"
                  }}
                  onKeyDown={e => e.key === "Enter" && startPrep()}
                />
                <div style={{
                  color: "#4b5563", fontSize: "12px", marginBottom: "16px"
                }}>
                  or drop your lecture slides / PDF here
                </div>
                <div style={{
                  border: "2px dashed #1f2937", borderRadius: "8px",
                  padding: "28px", textAlign: "center", marginBottom: "20px",
                  cursor: "pointer", color: "#4b5563", fontSize: "13px",
                  transition: "border-color 0.2s"
                }}>
                  📎 Click to upload or drag files
                </div>
                <button
                  onClick={startPrep}
                  disabled={!prepTopic.trim()}
                  style={{
                    width: "100%", padding: "12px",
                    background: prepTopic.trim()
                      ? "linear-gradient(135deg, #065f46, #059669)"
                      : "#1f2937",
                    color: prepTopic.trim() ? "#ecfdf5" : "#4b5563",
                    border: "none", borderRadius: "8px",
                    fontSize: "14px", fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: "all 0.2s"
                  }}
                >
                  Build Lecture Pack →
                </button>
              </div>
            </div>
          )}

          {prepStage >= 1 && prepStage < 5 && (
            <div style={{
              background: "#111827", borderRadius: "12px", padding: "28px",
              border: "1px solid #1f2937", textAlign: "left",
              animation: "fadeIn 0.5s ease"
            }}>
              <div style={{
                color: "#e5e7eb", fontSize: "14px", fontWeight: 600,
                marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif"
              }}>
                Building pack for: {prepTopic}
              </div>
              <div style={{
                color: "#6b7280", fontSize: "12px", marginBottom: "20px"
              }}>
                This takes about 2-5 minutes in production
              </div>

              {[
                { label: "Generating concept map", stage: 1 },
                { label: "Gathering visual assets", stage: 2 },
                { label: "Building knowledge base", stage: 3 },
                { label: "Quality check with Claude", stage: 4 },
              ].map(step => (
                <div key={step.stage} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  marginBottom: "12px", opacity: prepStage >= step.stage ? 1 : 0.3,
                  transition: "opacity 0.5s",
                  animation: prepStage === step.stage ? "fadeIn 0.4s ease" : "none"
                }}>
                  {prepStage > step.stage ? (
                    <span style={{ color: "#6ee7b7", fontSize: "16px" }}>✓</span>
                  ) : prepStage === step.stage ? (
                    <div style={{
                      width: "16px", height: "16px",
                      border: "2px solid #1f2937", borderTopColor: "#6ee7b7",
                      borderRadius: "50%", animation: "spin 0.8s linear infinite"
                    }} />
                  ) : (
                    <div style={{
                      width: "16px", height: "16px",
                      border: "2px solid #1f2937", borderRadius: "50%"
                    }} />
                  )}
                  <span style={{
                    color: prepStage >= step.stage ? "#d1d5db" : "#4b5563",
                    fontSize: "13px"
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {prepStage === 5 && (
            <div style={{
              background: "#111827", borderRadius: "12px", padding: "28px",
              border: "1px solid #065f46", textAlign: "center",
              animation: "fadeIn 0.5s ease"
            }}>
              <div style={{
                fontSize: "36px", marginBottom: "12px"
              }}>✅</div>
              <div style={{
                color: "#6ee7b7", fontSize: "16px", fontWeight: 700,
                marginBottom: "6px", fontFamily: "'Space Grotesk', sans-serif"
              }}>
                Lecture pack ready!
              </div>
              <div style={{
                color: "#9ca3af", fontSize: "13px", marginBottom: "24px"
              }}>
                28 concepts indexed • 15 diagrams loaded • 4 formulas
              </div>
              <button
                onClick={startLecture}
                style={{
                  padding: "12px 36px",
                  background: "linear-gradient(135deg, #065f46, #059669)",
                  color: "#ecfdf5", border: "none", borderRadius: "8px",
                  fontSize: "15px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                Start Lecture →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LIVE VIEW ---
  return (
    <div style={{
      width: "100%", height: "100vh", background: "#090d14",
      display: "flex", flexDirection: "column",
      fontFamily: "'IBM Plex Sans', sans-serif",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
      `}</style>

      {/* Status bar */}
      <StatusBar
        isRecording={isRecording}
        status={status}
        conceptCount={visibleConcepts.length}
        elapsed={elapsed}
      />

      {/* Main layout */}
      <div style={{
        flex: 1, display: "flex", overflow: "hidden"
      }}>
        {/* Left — Transcript */}
        <div style={{
          width: "35%", borderRight: "1px solid #1f2937",
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid #1f2937",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{
              color: "#9ca3af", fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase", letterSpacing: "0.08em"
            }}>
              Live Transcript
            </span>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: isRecording ? "#6ee7b7" : "#4b5563",
                animation: isRecording ? "pulse 2s infinite" : "none"
              }} />
              <span style={{ color: "#6b7280", fontSize: "11px" }}>
                {isRecording ? "listening" : "paused"}
              </span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <TranscriptPanel
              lines={DEMO_TRANSCRIPT_LINES}
              currentIndex={currentLine}
            />
          </div>
        </div>

        {/* Right — Concepts / Map / Notes */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", borderBottom: "1px solid #1f2937",
            background: "#0d1117"
          }}>
            {[
              { id: "concepts", label: "Visual Aids" },
              { id: "map", label: "Concept Map" },
              { id: "notes", label: "Notes" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                style={{
                  padding: "10px 20px", border: "none",
                  background: "transparent", cursor: "pointer",
                  color: rightTab === tab.id ? "#6ee7b7" : "#6b7280",
                  fontSize: "12px", fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  borderBottom: rightTab === tab.id
                    ? "2px solid #6ee7b7" : "2px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
                {tab.id === "concepts" && visibleConcepts.length > 0 && (
                  <span style={{
                    marginLeft: "6px", background: "#065f46",
                    color: "#6ee7b7", padding: "1px 6px",
                    borderRadius: "100px", fontSize: "10px"
                  }}>
                    {visibleConcepts.length}
                  </span>
                )}
              </button>
            ))}

            <div style={{ flex: 1 }} />
            <button
              onClick={isRecording ? stopLecture : startLecture}
              style={{
                margin: "6px 12px", padding: "4px 16px",
                background: isRecording ? "#991b1b" : "#065f46",
                color: isRecording ? "#fca5a5" : "#6ee7b7",
                border: "none", borderRadius: "6px",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              {isRecording ? "■ Stop" : "● Start"}
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: "auto", padding: rightTab === "map" ? "0" : "16px" }}>
            {rightTab === "concepts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {visibleConcepts.length === 0 ? (
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    height: "300px", color: "#4b5563", textAlign: "center"
                  }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.5 }}>🔍</div>
                    <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                      Listening for concepts...
                    </div>
                    <div style={{ fontSize: "12px", color: "#374151" }}>
                      Visual aids will appear as your lecturer speaks
                    </div>
                  </div>
                ) : (
                  visibleConcepts.map(c => (
                    <ConceptCard
                      key={c.concept_id}
                      concept={c}
                      isNew={c.concept_id === newestConceptId}
                    />
                  ))
                )}
              </div>
            )}
            {rightTab === "map" && (
              <div style={{
                height: "100%", display: "flex",
                flexDirection: "column", padding: "16px"
              }}>
                <div style={{
                  color: "#9ca3af", fontSize: "12px", marginBottom: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.08em"
                }}>
                  Live concept map — updates as new topics are detected
                </div>
                <div style={{
                  flex: 1, background: "#111827", borderRadius: "12px",
                  border: "1px solid #1f2937", padding: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <ConceptMap concepts={visibleConcepts} />
                </div>
              </div>
            )}
            {rightTab === "notes" && (
              <NotesPanel concepts={visibleConcepts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
