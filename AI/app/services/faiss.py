import os
import pickle
import numpy as np
import faiss

class FaissManager:
    def __init__(self, dim=128, index_path="storage/face_index.faiss", map_path="storage/id_map.pkl"):
        self.dim = dim
        self.index_path = index_path
        self.map_path = map_path
        self.index = None
        self.id_map = None
        self.load_index()

    def load_index(self):
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        else:
            self.index = faiss.IndexFlatL2(self.dim)
            
        if os.path.exists(self.map_path):
            self.id_map = pickle.load(open(self.map_path, "rb"))
        else:
            self.id_map = {}

    def save_index(self):
        faiss.write_index(self.index, self.index_path)
        pickle.dump(self.id_map, open(self.map_path, "wb"))

    def add_vector(self, embedding, face_record_id):
        vec = np.array(embedding, dtype="float32").reshape(1, -1)
        idx = self.index.ntotal
        self.index.add(vec)
        self.id_map[idx] = face_record_id
        self.save_index()

    def search_vector(self, embedding, k=5):
        query = np.array(embedding, dtype="float32").reshape(1, -1)
        distances, indices = self.index.search(query, k)
        final_results = []
    
        for i, d in zip(indices[0], distances[0]):
            if i != -1 and i in self.id_map:
                real_id = self.id_map[i]
                dist_score = float(d)
                final_results.append((real_id, dist_score))
                
        return final_results    