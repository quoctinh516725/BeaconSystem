# app/models/user.py

from pydantic import BaseModel

# Dữ liệu client gửi lên (create/update)
class UserCreate(BaseModel):
    name: str
    age: int

# Dữ liệu trả về (response)
class User(UserCreate):
    id: int