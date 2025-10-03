from datetime import UTC, datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sub: str = Field(index=True, unique=True)
    name: str
    email: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=UTC))
    last_login: Optional[datetime] = None
