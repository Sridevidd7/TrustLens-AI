# TrustLens AI

## Project overview
TrustLens AI is a premium, transparent AI decision-support dashboard for IT administrators. It helps teams review AI-generated recommendations before approving high-impact actions such as quarantining endpoints, enforcing MFA, rolling out patches, or removing guest access.

## Problem statement
Security teams often receive AI recommendations without enough explanation about why the recommendation was made, what evidence supports it, or what safer alternatives exist. TrustLens AI closes that gap by combining clear reasoning, confidence indicators, evidence, and auditability.

## Features
- Transparent reasoning and confidence explanations
- Evidence cards and data source attribution
- Human approval workflows for high-risk actions
- Audit trail with plain-language activity messages
- Decision simulator and autonomy settings
- Incident and usability reporting views

## Tech stack
- Frontend: React + Vite + Plain CSS
- Backend: Flask + SQLite + Flask-CORS
- Icons: lucide-react

## Folder structure
- `frontend/` contains the React dashboard application
- `backend/` contains Flask routes, database setup, and seed data

## How to run backend
1. `cd backend`
2. `python3 -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `python seed.py`
6. `python app.py`

## How to run frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## API endpoints
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/recommendations`
- `GET /api/recommendations/<id>`
- `GET /api/recommendations/<id>/explanation`
- `GET /api/recommendations/<id>/alternatives`
- `GET /api/recommendations/<id>/simulate`
- `GET /api/recommendations/<id>/agent-flow`
- `POST /api/recommendations/<id>/decision`
- `POST /api/recommendations/<id>/escalate`
- `GET /api/audit`
- `GET /api/settings/autonomy`
- `POST /api/settings/autonomy`
- `GET /api/incidents`
- `GET /api/usability`

## Demo flow
1. Open the dashboard to review pending recommendations.
2. Click a recommendation to inspect evidence, alternatives, and rationale.
3. Use the approval center to approve, reject, or escalate actions.
4. Check the simulator to understand the outcome of different decisions.
5. Review the audit trail and reports for a complete security workflow.

## Hackathon transparency checklist
- Why the AI recommended it
- Confidence level explained simply
- Data sources shown
- Missing information and alternatives listed
- Human approval required for critical actions
- Audit trail for every decision

## Future improvements
- Live role-based permissions
- Real-time notification center
- Exportable incident reports
- Integration with SIEM and ticketing tools
