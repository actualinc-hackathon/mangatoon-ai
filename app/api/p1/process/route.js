import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import sharp from "sharp";

export async function POST(request) {
  try {
    console.log("[API] Process request received");
    const { imageBase64, maskBase64 } = await request.json();

    const auth = new GoogleAuth({
      keyFilename: path.join(process.cwd(), "google-credentials.json"),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const projectId = "mangatoon-480314";
    const location = "us-central1";
    const imageBuffer = Buffer.from(imageBase64, "base64");

    console.log("[API] Step 1: Calling Vertex AI Imagen API for inpainting...");

    // Prompt: Remove masked areas + any remaining text/logos (inpainting only handles masked areas)
    const inpaintingPrompt = `
Remove and erase everything in the white masked areas. Also scan the entire image and remove any remaining text, logos, signs, billboards, advertisements, shop names, brand names in any language.
Fill all removed areas with clean natural background matching surroundings - walls, sky, buildings, ground textures.
Output a clean photo with no text, no logos, no signs anywhere.
    `.trim();

    try {
      const accessToken = await client.getAccessToken();
      const vertexAIUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`;

      const requestBody = {
        instances: [
          {
            prompt: inpaintingPrompt,
            image: { bytesBase64Encoded: imageBase64 },
            mask: { image: { bytesBase64Encoded: maskBase64 } },
          },
        ],
        parameters: {
          sampleCount: 1,
          safetyFilterLevel: "block_some",
        },
      };

      const inpaintResponse = await fetch(vertexAIUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!inpaintResponse.ok) {
        const errorText = await inpaintResponse.text();
        throw new Error(
          `Vertex AI Inpainting Failed: ${inpaintResponse.status} - ${errorText}`
        );
      }

      const inpaintData = await inpaintResponse.json();
      const generatedImageBase64 =
        inpaintData.predictions?.[0]?.bytesBase64Encoded;

      if (!generatedImageBase64) {
        throw new Error("Vertex AI returned no image");
      }

      const inpaintedBuffer = Buffer.from(generatedImageBase64, "base64");
      console.log("[API] Inpainting successful.");

      console.log("[API] Step 2: Creating pencil sketch effect...");

      // --- PENCIL SKETCH EFFECT (Color Dodge Technique) ---

      // Step 1: Convert to grayscale
      const grayscale = await sharp(inpaintedBuffer)
        .grayscale()
        .normalize()
        .toBuffer();

      // Step 2: Create inverted blurred layer (key for pencil effect)
      const invertedBlur = await sharp(grayscale)
        .negate()
        // Lower blur = clearer details (was 12)
        .blur(20)
        .toBuffer();

      // Step 3: Apply color dodge blend to create sketch
      const sketchBase = await sharp(grayscale)
        .composite([
          {
            input: invertedBlur,
            blend: "color-dodge",
          },
        ])
        .toBuffer();

      // Step 4: Create edge layer for line definition
      const edges = await sharp(grayscale)
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
          scale: 1,
        })
        .negate()
        .linear(1.5, 0)
        .toBuffer();

      // Step 5: Combine sketch with edges for better line work
      const finalMangaBuffer = await sharp(sketchBase)
        .composite([
          {
            input: edges,
            blend: "multiply",
            // Increased opacity for clearer lines (was 0.3)
            opacity: 1,
          },
        ])
        // Less brightness boost to keep definition
        .linear(1.1, 0)
        // Darken midtones using modulate brightness instead of gamma < 1.0
        .modulate({ brightness: 0.9 })
        .png()
        .toBuffer();

      console.log("[API] Pencil sketch conversion successful.");

      return new NextResponse(finalMangaBuffer, {
        headers: { "Content-Type": "image/png" },
      });
    } catch (error) {
      console.error(`[API] Vertex AI error: ${error.message}`);
      return new NextResponse(Buffer.from(imageBuffer), {
        headers: { "Content-Type": "image/png" },
      });
    }
  } catch (error) {
    console.error("[API] Processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
