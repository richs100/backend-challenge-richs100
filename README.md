# Simple OpenEvidence

Simple OpenEvidence is the leading medical information platform for healthcare professionals. It allows users to log in and ask questions about medical topics.

This application has a [Next.js](https://nextjs.org/) frontend and a [FastAPI](https://fastapi.tiangolo.com/) backend. The backend is deployed on Google Cloud.

## Setup

You will need various environment variables. Look for all `.env*.example` files, create the sibling `.env*` files, and fill in the values.

You will need Python 3.11, Poetry, Node.js 20, and npm.

## Run

### Backend

Install dependencies:

```sh
# from backend/
poetry install
```

Run the server:

```sh
# from backend/
poetry run uvicorn main:app --reload
```

### Frontend

Run the development server:

```bash
# from frontend/
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy

The backend service should be deployed to Google Cloud. The frontend is not deployed anywhere.

You can view the Google Cloud console at this url: https://console.cloud.google.com/welcome?organizationId=733301337686&project=oe-bc-richs100

Authenticate with Google Cloud:

```sh
gcloud auth login --update-adc
gcloud config set project "oe-bc-richs100"
```

Apply the infrastructure:

```sh
# from infra/
terraform init
terraform plan
terraform apply
```
