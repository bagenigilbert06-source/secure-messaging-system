# PostgreSQL Setup Guide for Zetech Backend

This guide will help you set up PostgreSQL for your Flask backend.

## Prerequisites

- PostgreSQL installed on your system
- Python 3.7+ installed
- pip or conda for package management

## Installation Steps

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
- Download installer from https://www.postgresql.org/download/windows/
- Run the installer and follow the setup wizard
- Remember the password you set for the `postgres` user

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database and User

Open PostgreSQL terminal:

```bash
# macOS/Linux
psql postgres

# Windows (from PostgreSQL shell)
psql -U postgres
```

Then run these SQL commands:

```sql
-- Create database
CREATE DATABASE zetech_db;

-- Create user (replace 'password' with a secure password)
CREATE USER zetech_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
ALTER ROLE zetech_user SET client_encoding TO 'utf8';
ALTER ROLE zetech_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE zetech_user SET default_transaction_deferrable TO on;
ALTER ROLE zetech_user SET default_transaction_read_uncommitted TO off;
GRANT ALL PRIVILEGES ON DATABASE zetech_db TO zetech_user;

-- Exit
\q
```

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The new requirements include:
- `psycopg2-binary`: PostgreSQL adapter for Python
- `SQLAlchemy==2.0.21`: Updated for better PostgreSQL support

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://zetech_user:secure_password_here@localhost:5432/zetech_db
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secure-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### 5. Initialize Database Tables

Run your Flask app to auto-create tables:

```bash
python app.py
```

Or use Flask CLI:

```bash
flask shell
>>> from app import db, create_app
>>> app = create_app()
>>> with app.app_context():
>>>     db.create_all()
```

### 6. Verify Connection

Test your database connection:

```bash
psql -U zetech_user -d zetech_db -h localhost
```

You should see the `zetech_db=#` prompt.

## Connection String Format

The standard PostgreSQL connection string format:

```
postgresql://username:password@host:port/database_name
```

- `username`: Your database user (e.g., `zetech_user`)
- `password`: Your database password
- `host`: Database server address (e.g., `localhost` or `127.0.0.1`)
- `port`: PostgreSQL port (default: `5432`)
- `database_name`: Your database name (e.g., `zetech_db`)

## Common Issues

### Connection Refused
- Ensure PostgreSQL is running: `pg_isrunning` or `sudo systemctl status postgresql`
- Check host and port in connection string
- Verify firewall isn't blocking port 5432

### Authentication Failed
- Verify username and password are correct
- Check user has privileges: `GRANT ALL PRIVILEGES ON DATABASE zetech_db TO zetech_user;`

### psycopg2 Installation Issues
- On macOS with Apple Silicon, use: `pip install psycopg2-binary`
- On Linux, you may need: `sudo apt-get install python3-dev libpq-dev`

### Module Not Found
- Ensure you've installed requirements: `pip install -r requirements.txt`
- Use virtual environment: `python -m venv venv` then activate it

## Production Deployment

For production, use:

```env
DATABASE_URL=postgresql://zetech_user:secure_password@your-production-host:5432/zetech_db_prod
FLASK_ENV=production
```

Use a database hosting service like:
- AWS RDS PostgreSQL
- Heroku PostgreSQL
- DigitalOcean Managed Databases
- Railway
- Render

## Backup and Restore

### Backup Database
```bash
pg_dump -U zetech_user -d zetech_db > backup.sql
```

### Restore Database
```bash
psql -U zetech_user -d zetech_db < backup.sql
```

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- SQLAlchemy Documentation: https://docs.sqlalchemy.org/
- Flask-SQLAlchemy Documentation: https://flask-sqlalchemy.palletsprojects.com/
