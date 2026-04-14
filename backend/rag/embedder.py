import os
import fitz  # PyMuPDF
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle

GUIDELINES_DIR = "rag/guidelines"
INDEX_DIR = "rag/index"
INDEX_PATH = f"{INDEX_DIR}/faiss_index.index"
METADATA_PATH = f"{INDEX_DIR}/metadata.pkl"

os.makedirs(INDEX_DIR, exist_ok=True)

MODEL_NAME = 'all-MiniLM-L6-v2'
CACHE_DIR = "rag/model_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

_model = None

def get_model():
    """Lazy initialization of the SentenceTransformer model with local caching and error handling."""
    global _model
    if _model is None:
        try:
            print(f"🔄 Initializing embedding model: {MODEL_NAME}...")
            # Use local cache to ensure persistence and control
            _model = SentenceTransformer(MODEL_NAME, cache_folder=CACHE_DIR)
            print("✅ Embedding model loaded successfully.")
        except Exception as e:
            print(f"❌ Failed to load embedding model: {e}")
            print("💡 TIP: Check your internet connection or try setting HF_ENDPOINT=https://hf-mirror.com in your .env")
            # Return a dummy model or raise if critical
            raise e
    return _model

def get_metadata(filename):
    """Assign metadata based on filename for sample implementation"""
    metadata = {
        "condition_tags": [],
        "age_group": "adult",
        "severity_context": "chronic",
        "source_document": filename
    }
    
    if "cardio" in filename.lower():
        metadata["condition_tags"] = ["cardiovascular", "heart"]
    elif "diabetes" in filename.lower():
        metadata["condition_tags"] = ["diabetes", "sugar"]
    elif "hypertension" in filename.lower():
        metadata["condition_tags"] = ["hypertension", "bp"]
    
    return metadata

def build_index():
    if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
        print("Index already exists, skipping build.")
        return

    all_chunks = []
    all_metadata = []

    if not os.path.exists(GUIDELINES_DIR):
        os.makedirs(GUIDELINES_DIR)
        print("No guidelines directory found. Creating empty directory - RAG will fallback to LLM-only mode.")
        # Create empty index so app doesn't crash
        dimension = 384  # all-MiniLM-L6-v2 dimension
        index = faiss.IndexFlatL2(dimension)
        faiss.write_index(index, INDEX_PATH)
        with open(METADATA_PATH, "wb") as f:
            pickle.dump([], f)
        print("Empty FAISS index created. RAG retriever will return no results until guidelines are added.")
        return

    for filename in os.listdir(GUIDELINES_DIR):
        if filename.endswith(".pdf"):
            path = os.path.join(GUIDELINES_DIR, filename)
            doc = fitz.open(path)
            file_meta = get_metadata(filename)
            
            text = ""
            for page in doc:
                text += page.get_text()
            
            # Simple chunking: 512 tokens (roughly 2000 chars) with overlap
            chunk_size = 1500
            overlap = 200
            
            for i in range(0, len(text), chunk_size - overlap):
                chunk = text[i:i + chunk_size]
                all_chunks.append(chunk)
                all_metadata.append({**file_meta, "text": chunk})

    if not all_chunks:
        print("No documents found to index.")
        return

    embeddings = get_model().encode(all_chunks)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype('float32'))

    faiss.write_index(index, INDEX_PATH)
    with open(METADATA_PATH, "wb") as f:
        pickle.dump(all_metadata, f)
    
    print(f"Index built with {len(all_chunks)} chunks.")

if __name__ == "__main__":
    build_index()
