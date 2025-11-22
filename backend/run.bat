@echo off
echo Starting StockMaster Backend...

:: Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate

:: Install requirements
echo Installing dependencies...
pip install -r requirements.txt

:: Initialize database (optional)
set /p init_db="Initialize database with sample data? (y/N): "
if /i "%init_db%"=="y" (
    echo Initializing database...
    python init_db.py
)

:: Start the Flask application
echo Starting Flask server...
python app.py

pause