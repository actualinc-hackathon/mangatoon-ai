import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request) {
  try {
    console.log("[API] Background removal request received");
    const formData = await request.formData();

    const characterFile = formData.get("character");
    const maskFile = formData.get("mask");

    if (!characterFile || !maskFile) {
      return NextResponse.json(
        { error: "Character image and mask are required" },
        { status: 400 }
      );
    }

    // Convert files to buffers
    const characterBuffer = Buffer.from(await characterFile.arrayBuffer());
    const maskBuffer = Buffer.from(await maskFile.arrayBuffer());

    console.log("[API] Processing background removal with mask");

    // Get character dimensions
    const characterMetadata = await sharp(characterBuffer).metadata();
    const charWidth = characterMetadata.width;
    const charHeight = characterMetadata.height;

    // Resize mask to match character dimensions
    const resizedMask = await sharp(maskBuffer)
      .resize(charWidth, charHeight)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data: maskData, info: maskInfo } = resizedMask;

    // Get character image data
    const charImage = await sharp(characterBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data: charData, info: charInfo } = charImage;

    // Apply mask: where mask is black (0), make transparent
    const channels = 4;
    const newData = Buffer.alloc(charData.length);

    for (let i = 0; i < charData.length; i += channels) {
      const maskIdx = Math.floor(i / channels);
      const maskValue = maskData[maskIdx]; // 0-255, where 0 = black (remove), 255 = white (keep)

      // If mask is dark (background to remove), make transparent
      // Use threshold: if mask < 128, remove it
      if (maskValue < 128) {
        newData[i] = charData[i]; // R
        newData[i + 1] = charData[i + 1]; // G
        newData[i + 2] = charData[i + 2]; // B
        newData[i + 3] = 0; // A - transparent
      } else {
        // Keep original
        newData[i] = charData[i];
        newData[i + 1] = charData[i + 1];
        newData[i + 2] = charData[i + 2];
        newData[i + 3] = charData[i + 3];
      }
    }

    // Convert back to PNG with transparency
    const result = await sharp(newData, {
      raw: {
        width: charInfo.width,
        height: charInfo.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    console.log("[API] Background removal complete");

    return new NextResponse(result, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error("[API] Background removal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
