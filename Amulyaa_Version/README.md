# TrustLens AI — Amulyaa Version

Transparent AI decisions for safer IT operations.

TrustLens AI is a premium hackathon-style dashboard for IT administrators. It explains AI recommendations in plain language before high-impact actions are approved.

## Features

- Premium dark enterprise UI with glassmorphism cards
- AI recommendation dashboard
- Plain-language reasoning steps
- Confidence labels and confidence explanation
- Data source attribution
- Known limitations
- Alternatives considered
- Human-in-the-loop approval, rejection, override, and escalation
- Decision simulator
- Searchable audit trail
- Autonomy dial
- AI incident card
- Usability testing summary

## Tech Stack

Frontend: React, Vite, React Router, lucide-react, plain CSS  
Backend: Flask, SQLite, Flask-CORS

## Run Backend

```bash
cd Amulyaa_Version/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
python app.py
```

Backend runs on:

```text
http://localhost:5001
```

Test:

```text
http://localhost:5001/api/health
```

## Run Frontend

Open a second terminal:

```bash
cd Amulyaa_Version/frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo Flow

1. Open Command Center.
2. Select a critical recommendation.
3. Review reasoning, confidence, data sources, limitations, and alternatives.
4. Open Decision Simulator.
5. Approve, reject, or escalate from Approval Center.
6. Check Audit Trail.
7. Show Autonomy Dial, AI Incident Card, and Usability Results.

## Transparency Checklist

- Reasoning: yes
- Confidence: yes
- Data sources: yes
- Known limitations: yes
- Human approval: yes
- Audit trail: yes
