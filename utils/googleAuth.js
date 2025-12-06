import { GoogleAuth } from "google-auth-library";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";
import fs from "fs";
import os from "os";

/**
 * Get Google Auth configuration - supports both environment variable and file
 */
export function getGoogleAuthConfig() {
  // Check if credentials are provided via environment variable (for Vercel)
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (credentialsJson) {
    // Parse the JSON string from environment variable
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (error) {
      throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format");
    }

    // Create a temporary file with the credentials
    const tempFilePath = path.join(
      os.tmpdir(),
      `google-credentials-${Date.now()}.json`
    );
    fs.writeFileSync(tempFilePath, JSON.stringify(credentials, null, 2));

    return {
      keyFilename: tempFilePath,
    };
  } else {
    // Fall back to local file (for development)
    const localPath = path.join(process.cwd(), "google-credentials.json");
    if (!fs.existsSync(localPath)) {
      throw new Error(
        "Google credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable or provide google-credentials.json file."
      );
    }
    return {
      keyFilename: localPath,
    };
  }
}

/**
 * Get GoogleAuth instance
 */
export function getGoogleAuth() {
  const config = getGoogleAuthConfig();
  return new GoogleAuth({
    ...config,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
}

/**
 * Get ImageAnnotatorClient instance
 */
export function getImageAnnotatorClient() {
  const config = getGoogleAuthConfig();
  return new ImageAnnotatorClient(config);
}
