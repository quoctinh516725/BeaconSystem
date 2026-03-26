import os
import numpy as np
import faiss

from app.utils.convert import convert_uuid_to_int

class FaissManager:
    def __init__(self, dim=512, index_path="storage/face_index.faiss"):
        self.dim = dim
        self.index_path = index_path
        self.index = None
        self.load_index()

    def load_index(self):
        if os.path.exists(self.index_path) and os.path.getsize(self.index_path) > 0:
            try:
                self.index = faiss.read_index(self.index_path)
            except:
                self.index = faiss.IndexIDMap(faiss.IndexFlatL2(self.dim))
        else:
            self.index = faiss.IndexIDMap(faiss.IndexFlatL2(self.dim))
      
    def save_index(self):           
        faiss.write_index(self.index, self.index_path)

    def add_vector(self, embedding, person_id):
        vec = np.array(embedding, dtype="float32").reshape(1, -1)

        faiss_id = convert_uuid_to_int(person_id)
        ids = np.array([faiss_id], dtype="int64")
        self.index.add_with_ids(vec, ids)
        self.save_index()

    def search_vector(self, embedding, k=5):
        query = np.array(embedding, dtype="float32").reshape(1, -1)
        distances, ids = self.index.search(query, k)
        final_results = []
    
        for i in range(len(ids[0])):    
            person_id = ids[0][i]
            dist_score = distances[0][i]

            if person_id != -1:
                final_results.append((str(person_id), float(dist_score)))
                
        return final_results    