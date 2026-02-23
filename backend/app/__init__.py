from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from sqlalchemy import text

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory function."""
    app = Flask(__name__)
    
    # Import config
    from config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS to allow frontend requests
    CORS(
        app,
        origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
        max_age=3600
    )
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    with app.app_context():
        # Import models
        from app.models import User, Item, Message, Image
        from app.utils.decorators import TokenBlocklist
        # Create tables using the same connection where we set the search_path.
        # This avoids Neon rejecting startup 'options' while ensuring DDL runs in the
        # public schema for Postgres connections.
        try:
            # Use a transactional connection so schema creation and SET persist
            # for the subsequent DDL statements. This ensures Postgres/Neon
            # connections have the `public` schema available and selected.
            with db.engine.begin() as conn:
                try:
                    # ensure the public schema exists (avoid InvalidSchemaName)
                    conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
                    # set the search_path so DDL runs in public for Postgres
                    conn.execute(text("SET search_path TO public"))
                except Exception:
                    # ignore if DB doesn't support these statements (e.g., sqlite)
                    pass
                # Use the same transactional connection for DDL
                db.metadata.create_all(bind=conn)
        except Exception:
            # Fallback: try the generic create_all which will work for sqlite/local dev
            db.create_all()
        
        # Register blueprints
        from app.routes import auth_bp, items_bp, messages_bp, admin_bp
        app.register_blueprint(auth_bp)
        app.register_blueprint(items_bp)
        app.register_blueprint(messages_bp)
        app.register_blueprint(admin_bp)
        
        # Register CLI commands
        from app.cli import register_cli
        register_cli(app)
    
    return app
