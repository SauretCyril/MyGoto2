import eel
import sys
from pathlib import Path
import src.py.function3 as functions3  # Import the function3 module
import logging

# Configure logging
logging.basicConfig(filename='app.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Add the parent directory of the current file to the Python path
sys.path.append(str(Path(__file__).parent))

def main():
    eel.init("src/web")  # EEL initialization
    eel.start("main3.html", size=(1000, 800), port=8080)  # Starting the App on a different port
    # eel.start("qa.html", size=(1000, 800))

if __name__ == "__main__":
    main()