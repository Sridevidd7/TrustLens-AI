# TrustLens AI

AI-assisted security decision intelligence with full human oversight, explainability, and audit trails.

---

## Project structure

```
trustlens/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── index.html          # Vite entry point
├── vite.config.js      # Vite + Tailwind config
├── package.json        # Node dependencies
└── src/
    ├── main.jsx        # React application
    └── index.css       # Tailwind + global styles
```

---

## Quick start

### 1. Backend (Flask)

```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the dev server (creates trustlens.db automatically)
python app.py
```

Backend runs at **http://localhost:5000**

---

### 2. Frontend (Vite + React)

```bash
# Install Node dependencies
npm install

# Start the dev server (proxies /api to localhost:5000)
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Production

### Backend
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
Set `ALLOWED_ORIGIN` env var to your frontend's domain:
```bash
ALLOWED_ORIGIN=https://your-domain.com gunicorn -w 4 app:app
```

### Frontend
```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

---

## Environment variables

| Variable         | Default                    | Description                      |
|------------------|----------------------------|----------------------------------|
| `ALLOWED_ORIGIN` | `http://localhost:5173`    | CORS allowed origin for the API  |

---

## API reference

| Method | Path                                  | Description                          |
|--------|---------------------------------------|--------------------------------------|
| GET    | `/api/dashboard`                      | Stats, recommendations, audit log    |
| GET    | `/api/recommendations/:id`            | Single recommendation detail         |
| POST   | `/api/recommendations/:id/decision`   | Approve or reject a recommendation   |
| GET    | `/api/courtroom/:id`                  | Evidence vs limitations view         |
| GET    | `/api/simulate/:id`                   | Approve vs reject outcome simulation |
| GET    | `/api/alternatives/:id`               | Alternative actions                  |
| POST   | `/api/escalate/:id`                   | Escalate to human review             |
| GET    | `/api/agent-flow/:id`                 | Agent list for a recommendation      |
