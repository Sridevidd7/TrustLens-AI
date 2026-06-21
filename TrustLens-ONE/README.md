# TrustLens ONE

TrustLens ONE is the consolidated, hackathon-ready version of the TrustLens projects. It turns five specialist AI capabilities into one accountable decision system:

- Sentinel — threat detection
- PolicyGuard — policy validation
- RiskGraph — dependency and blast-radius analysis
- ImpactSim — approve/reject outcome simulation
- ExplainAI — evidence, limitations, and plain-language reasoning

The fusion engine weighs every model, exposes disagreement, applies non-negotiable guardrails, and keeps a human in control of high-impact actions.

## Demo flow

1. Open Mission Control and run a unified analysis.
2. Open Fusion Engine to show the five-model consensus.
3. Select a recommendation and inspect reasoning, sources, limitations, and human context.
4. Challenge it in AI Courtroom.
5. Compare approve/reject outcomes in Decision Simulator.
6. Approve, reject with a reason, or escalate.
7. Show the append-only Audit Trail, Incident Lab, and Governance controls.

## Run locally

Backend:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Frontend:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The UI includes complete demo data if the Flask backend is not running.
