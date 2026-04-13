import os
import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

INDEX_DIR = "rag/index"
INDEX_PATH = f"{INDEX_DIR}/faiss_index.index"
METADATA_PATH = f"{INDEX_DIR}/metadata.pkl"

model = SentenceTransformer('all-MiniLM-L6-v2')

def retrieve(query: str, top_k: int = 5, condition_tags: list[str] = None):
    if not os.path.exists(INDEX_PATH) or not os.path.exists(METADATA_PATH):
        return []

    index = faiss.read_index(INDEX_PATH)
    with open(METADATA_PATH, "rb") as f:
        all_metadata = pickle.load(f)

    query_embedding = model.encode([query])
    
    # Simple filtering: find matching tags first if provided
    # For now, we perform local search then filter or vice-versa.
    # A better way is to use a subset of the index, but for small data, this works:
    
    distances, indices = index.search(np.array(query_embedding).astype('float32'), top_k * 2)
    
    results = []
    for idx in indices[0]:
        if idx == -1: continue
        meta = all_metadata[idx]
        
        # Optional tag filtering
        if condition_tags:
            match = any(tag in meta["condition_tags"] for tag in condition_tags)
            if not match: continue
            
        results.append({
            "text": meta["text"],
            "source": meta["source_document"]
        })
        
        if len(results) >= top_k:
            break
            
    return results
