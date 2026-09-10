# TrustLens ONE

TrustLens ONE is an AI-powered security decision platform that helps IT and security teams review, challenge, and act on AI-generated recommendations — with full transparency and human control at every step.

Instead of trusting a single AI model, TrustLens ONE runs five specialist models in parallel and fuses their outputs into one ranked, explainable recommendation:

- **Sentinel** — detects threats across endpoint, identity, and network telemetry
- **PolicyGuard** — validates every proposed action against active security policies
- **RiskGraph** — maps blast radius and resource dependencies before any change
- **ImpactSim** — simulates approve vs. reject outcomes side by side
- **ExplainAI** — surfaces evidence, data sources, and known limitations in plain language

The platform is built for teams that need to move fast but can't afford blind trust in automation. Every recommendation comes with traceable reasoning, a confidence score, and a mandatory human checkpoint before any high-impact action is taken.

---

## Key capabilities

- **Mission Control** — live dashboard with recommendations ranked by severity and model consensus
- **Fusion Engine** — real-time view of five-model consensus with guardrail status
- **AI Courtroom** — challenge a recommendation with prosecution evidence and defense arguments
- **Decision Simulator** — compare approve vs. reject outcomes before committing
- **Trust Readiness Score** — explainable measure of how confident the system is across all active decisions
- **Agent Consensus View** — per-model confidence scores and individual rationale
- **Human Context Override** — attach business context that persists alongside AI analysis
- **Approval Center** — approve, reject (with mandatory reason), or escalate to a human expert
- **Audit Trail** — append-only, filterable log of every action and decision
- **Incident Lab** — post-mortem cases showing where guardrails intercepted risky AI actions
- **Governance controls** — configure autonomy level from "always ask a human" to "auto-execute low-risk actions"

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router, Tailwind CSS v4, Vite |
| Backend | Python, Flask, SQLite |
| Icons | Lucide React |

The UI ships with complete demo data, so it works fully even without the Flask backend running.

---

## Run locally

**Backend:**

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend:**

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Demo flow

1. Open **Mission Control** and run a unified analysis.
2. Open **Fusion Engine** to see the five-model consensus.
3. Select a recommendation and inspect reasoning, sources, limitations, and human context.
4. Challenge it in **AI Courtroom**.
5. Compare approve vs. reject outcomes in **Decision Simulator**.
6. Approve, reject with a reason, or escalate.
7. Review the append-only **Audit Trail**, **Incident Lab**, and **Governance** controls.
