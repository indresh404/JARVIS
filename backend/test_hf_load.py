import os
from dotenv import load_dotenv

# Load .env BEFORE importing sentence_transformers
load_dotenv()

# Explicitly set them again just to be absolutely sure
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'

from sentence_transformers import SentenceTransformer

print(f"HF_ENDPOINT (environ): {os.environ.get('HF_ENDPOINT')}")
print(f"CACHE_DIR: rag/model_cache")

model_name = 'all-MiniLM-L6-v2'
cache_dir = "rag/model_cache"

try:
    print(f"--- Attempting to load '{model_name}' via mirror ---")
    model = SentenceTransformer(model_name, cache_folder=cache_dir)
    print("DONE: Model loaded.")
    
    # Test encoding
    print("--- Testing encoding ---")
    embedding = model.encode(["Hello World"])
    print(f"DONE: Encoding successful. Vector shape: {embedding.shape}")
    
except Exception as e:
    print(f"ERROR: Error during model load: {e}")
