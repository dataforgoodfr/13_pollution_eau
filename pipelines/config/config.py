from dotenv import load_dotenv
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the .env file
dotenv_path = os.path.join(current_dir, '.env')

# Load the .env file
load_dotenv(dotenv_path)