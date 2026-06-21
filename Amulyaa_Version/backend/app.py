from flask import Flask
from flask_cors import CORS
from db import init_db, insert_default_settings
from seed import seed_database
from routes.dashboard import bp as dashboard_bp
from routes.recommendations import bp as recommendations_bp
from routes.audit import bp as audit_bp
from routes.settings import bp as settings_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config["JSON_SORT_KEYS"] = False

app.register_blueprint(dashboard_bp)
app.register_blueprint(recommendations_bp)
app.register_blueprint(audit_bp)
app.register_blueprint(settings_bp)

init_db()
insert_default_settings()
seed_database()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
