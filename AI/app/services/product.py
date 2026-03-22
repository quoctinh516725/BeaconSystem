from sqlalchemy.orm import Session
from app.models.entities.product import User

# CREATE
def create_user(db: Session, data):
    user = User(name=data.name, age=data.age)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# READ ALL
def get_users(db: Session):
    return db.query(User).all()


# READ ONE
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


# UPDATE
def update_user(db: Session, user_id: int, data):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    user.name = data.name
    user.age = data.age
    db.commit()
    db.refresh(user)
    return user


# DELETE
def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    db.delete(user)
    db.commit()
    return user