import json
import os
from datetime import UTC, datetime
from typing import Annotated

import jwt
from database import create_db_and_tables, get_session
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from models import User
from openai import OpenAI
from sqlmodel import Session, select

load_dotenv()
api_key = os.environ["OPENAI_API_KEY"]

app = FastAPI()
security = HTTPBearer()


@app.on_event("startup")
def on_startup():
    print(f"API key: {api_key}")
    create_db_and_tables()


client = OpenAI(
    api_key=api_key,
)

NEXTAUTH_SECRET = os.environ["NEXTAUTH_SECRET"]


def authenticate(token: dict, session: Session) -> User:
    """Create or update user in database and return user object"""
    user_sub = token["sub"]
    user_name = token["name"]

    user = session.exec(select(User).where(User.sub == user_sub)).first()

    if not user:
        user = User(sub=user_sub, name=user_name)
        session.add(user)
    else:
        user.last_login = datetime.now(tz=UTC)

    session.commit()
    session.refresh(user)
    return user

async def getData(
    request: Request,
    token: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Session = Depends(get_session),        
):
    try:
        decoded_token = jwt.decode(  # type: ignore
            token.credentials, NEXTAUTH_SECRET, algorithms=["HS512"]
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    user = authenticate(decoded_token, session)
    print(f"Authenticated user: {user.name} ({user.sub})")


@app.post("/upload")
async def upload(
    request: Request,
    token: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Session = Depends(get_session),
):
    getData(request, token, session)
    contents = await request.body()
    # file = File(contents)
    try:
        uploaded_file = client.files.create(
            file=contents,
            purpose="assistants",
        )
        print(f"Uploaded file: {uploaded_file}")
        return uploaded_file
    except Exception as e:
        print(f"Except: {e}")
        return {"error": str(e)}, 500


@app.post("/ask")
async def ask(
    request: Request,
    token: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Session = Depends(get_session),
):
    getData(request, token, session)
    dataBytes = await request.body()
    data = json.loads(dataBytes)
    question = data.get("question")
    history = data.get("history", [])
    uploadedFile = data.get("uploadedFile")
    messages = [
        {
            "role": "system",
            "content": "Your are MedicalGPT, a medical assistant that answers questions about medical conditions and treatments. You are speaking to an experienced highly-trained medical professional. Be assured that they will exercise their expert clinical judgment in interpreting and acting on any of your responses. You are helpful, honest, precise, and succinct. ",
        },
        *history,
        {
            "role": "user",
            "content": question,
        },
        
    ]
    if uploadedFile:
        messages.insert(
            -1,
            {
                "type": "file",
                "file_id": uploadedFile.id,
            },
        )

    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="gpt-4.1",
        )
        print(f"Chat: {chat_completion}")
        return {"answer": chat_completion.choices[0].message.content}
    except Exception as e:
        print(f"Except: {e}")
        return {"error": str(e)}, 500
