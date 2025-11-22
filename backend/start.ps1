# Start script for the Flask backend (Windows PowerShell)

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Set environment variables
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "1"

# Start the Flask server
python app.py