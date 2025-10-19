from google.cloud import secretmanager_v1

def access_secret_version(project_id, secret_id, version_id="latest"):
    """
    Accesses a secret version from Google Cloud Secret Manager.

    Args:
        project_id (str): The ID of your Google Cloud project.
        secret_id (str): The ID of the secret.
        version_id (str): The version of the secret to access (e.g., "latest" or a specific version number).

    Returns:
        str: The secret payload as a string.
    """
    client = secretmanager_v1.SecretManagerServiceClient()

    # Build the resource name of the secret version.
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"

    # Access the secret version.
    response = client.access_secret_version(request={"name": name})

    # Return the secret payload.
    return response.payload.data.decode("UTF-8")

