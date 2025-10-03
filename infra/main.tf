terraform {
  required_version = ">= 1.5.7"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.42.0"
    }
  }
}

resource "google_project" "project" {
  name            = "oe-bc-richs100"
  project_id      = "oe-bc-richs100"
  folder_id       = "894326004365"
  billing_account = "0152AF-891A4F-A80E37"
}

resource "google_project_service" "service" {
  # you may need some of these, or you may need to add more
  for_each = toset([
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudtrace.googleapis.com",
    "compute.googleapis.com",
    "container.googleapis.com",
    "iam.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "storage.googleapis.com",
  ])
  project = google_project.project.project_id
  service = each.key

  depends_on = [google_project.project]
}

resource "google_artifact_registry_repository" "repo" {
  location      = "us"
  repository_id = "simple-openevidence"
  project       = google_project.project.project_id
  format        = "DOCKER"
  depends_on    = [google_project_service.service["artifactregistry.googleapis.com"]]
}
