import os

from sqlmodel import Session, SQLModel, create_engine

DB_URL = os.environ.get("DB_URL", "sqlite:///./users.db")

engine = create_engine(
    DB_URL, connect_args={"check_same_thread": False} if "sqlite" in DB_URL else {}
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
