from pydantic import BaseModel

class SearchRequest(BaseModel):
    image_path: str

class SearchResponse(BaseModel):
    data: list[tuple[str, float]]  # List of (person_id, distance_score)
    message: str