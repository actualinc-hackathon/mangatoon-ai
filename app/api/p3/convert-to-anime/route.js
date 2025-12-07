import { NextResponse } from "next/server";
import sharp from "sharp";
import { getGoogleAuth } from "@/utils/googleAuth";

export async function POST(request) {
  try {
    console.log("[API] Photo-to-anime conversion request received");

    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error("[API] FormData parsing error:", formError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = buffer.toString("base64");

    const auth = getGoogleAuth();
    const client = await auth.getClient();
    const projectId = "mangatoon-480314";
    const location = "us-central1";

    console.log("[API] Calling Vertex AI Imagen Subject Customization API...");

    try {
      const accessToken = await client.getAccessToken();

      // Use Imagen 3 for instruct customization (subject customization)
      const vertexAIUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-capability-001:predict`;

      // Realistic sketch prompt: dark person sketch on pure white background
      const animePrompt = `Convert the person in image [1] into a realistic black and white pencil sketch. Preserve exact facial features, appearance, and likeness. The person must be drawn with dark shading, dark lines, and dark shadows - only the area inside the person should be dark. The background must be completely pure white, no dark shades, no shadows, no lines, absolutely nothing dark outside the person. Pure white background only.`;

      const requestBody = {
        instances: [
          {
            prompt: animePrompt,
            referenceImages: [
              {
                referenceType: "REFERENCE_TYPE_SUBJECT",
                referenceId: 1,
                referenceImage: {
                  bytesBase64Encoded: imageBase64,
                },
                subjectImageConfig: {
                  subjectType: "SUBJECT_TYPE_PERSON",
                },
              },
            ],
          },
        ],
        parameters: {
          sampleCount: 1,
          safetyFilterLevel: "block_some",
        },
      };

      const response = await fetch(vertexAIUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[API] Vertex AI Error: ${response.status} - ${errorText}`
        );
        throw new Error(
          `Vertex AI Conversion Failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      const generatedImageBase64 = data.predictions?.[0]?.bytesBase64Encoded;

      if (!generatedImageBase64) {
        throw new Error("Vertex AI returned no image");
      }

      const resultBuffer = Buffer.from(generatedImageBase64, "base64");
      console.log("[API] Photo-to-anime conversion successful.");

      return new NextResponse(resultBuffer, {
        headers: { "Content-Type": "image/png" },
      });
    } catch (error) {
      console.error(`[API] Vertex AI error: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error("[API] Conversion error:", error);
    const errorMessage =
      error?.message || error?.toString() || "Conversion failed";
    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
