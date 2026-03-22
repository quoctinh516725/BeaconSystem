from fastapi import FastAPI

from app.routers import product

app = FastAPI()

app.include_router(product.router)

@app.get("/")
def root():
    return {"message": "Hello World"}

