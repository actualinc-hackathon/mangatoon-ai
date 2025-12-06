import { NextResponse } from "next/server";
import sharp from "sharp";

// Flood fill to remove only connected white background from edges
function floodFillRemoveBackground(data, width, height, threshold) {
  const channels = 4;
  const visited = new Uint8Array(width * height);
  const toMakeTransparent = new Set();

  // Check if a pixel is "white-ish" based on threshold
  const isWhite = (idx) => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r >= threshold && g >= threshold && b >= threshold;
  };

  // Get pixel index from x, y
  const getIdx = (x, y) => (y * width + x) * channels;
  const getVisitedIdx = (x, y) => y * width + x;

  // BFS flood fill from a starting point
  const floodFill = (startX, startY) => {
    const queue = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift();

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const visitedIdx = getVisitedIdx(x, y);
      if (visited[visitedIdx]) continue;

      const idx = getIdx(x, y);
      if (!isWhite(idx)) continue;

      visited[visitedIdx] = 1;
      toMakeTransparent.add(idx);

      // Add 4-connected neighbors
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
  };

  // Start flood fill from all edges
  // Top and bottom edges
  for (let x = 0; x < width; x++) {
    if (isWhite(getIdx(x, 0))) floodFill(x, 0);
    if (isWhite(getIdx(x, height - 1))) floodFill(x, height - 1);
  }

  // Left and right edges
  for (let y = 0; y < height; y++) {
    if (isWhite(getIdx(0, y))) floodFill(0, y);
    if (isWhite(getIdx(width - 1, y))) floodFill(width - 1, y);
  }

  // Create new buffer with transparent background
  const newData = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += channels) {
    newData[i] = data[i]; // R
    newData[i + 1] = data[i + 1]; // G
    newData[i + 2] = data[i + 2]; // B

    if (toMakeTransparent.has(i)) {
      newData[i + 3] = 0; // Transparent
    } else {
      newData[i + 3] = data[i + 3]; // Keep original alpha
    }
  }

  return newData;
}

// Color-based removal: removes pixels similar to the picked color
function colorBasedRemoveBackground(
  data,
  width,
  height,
  targetColor,
  tolerance
) {
  const channels = 4;
  const newData = Buffer.alloc(data.length);

  // Calculate color distance (Euclidean distance in RGB space)
  const colorDistance = (r1, g1, b1, r2, g2, b2) => {
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );
  };

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Calculate distance from target color
    const distance = colorDistance(
      r,
      g,
      b,
      targetColor.r,
      targetColor.g,
      targetColor.b
    );

    // If color is similar enough, make transparent
    if (distance <= tolerance) {
      newData[i] = r;
      newData[i + 1] = g;
      newData[i + 2] = b;
      newData[i + 3] = 0; // Transparent
    } else {
      // Keep original
      newData[i] = r;
      newData[i + 1] = g;
      newData[i + 2] = b;
      newData[i + 3] = a;
    }
  }

  return newData;
}

export async function POST(request) {
  try {
    console.log("[API] Character insert request received");
    const formData = await request.formData();

    const mangaFile = formData.get("manga");
    const characterFile = formData.get("character");
    const x = parseInt(formData.get("x") || "0");
    const y = parseInt(formData.get("y") || "0");
    const scale = parseFloat(formData.get("scale") || "1");
    const threshold = parseInt(formData.get("threshold") || "240");
    const mode = formData.get("mode") || "sketch";
    const colorR = formData.get("colorR");
    const colorG = formData.get("colorG");
    const colorB = formData.get("colorB");
    const colorTolerance = parseInt(formData.get("colorTolerance") || "30");

    if (!mangaFile || !characterFile) {
      return NextResponse.json(
        { error: "Both manga and character images are required" },
        { status: 400 }
      );
    }

    // Convert files to buffers
    const mangaBuffer = Buffer.from(await mangaFile.arrayBuffer());
    const characterBuffer = Buffer.from(await characterFile.arrayBuffer());

    // Get manga dimensions
    const mangaMetadata = await sharp(mangaBuffer).metadata();
    const mangaWidth = mangaMetadata.width;
    const mangaHeight = mangaMetadata.height;
    console.log(`[API] Manga dimensions: ${mangaWidth}x${mangaHeight}`);

    // Get character dimensions
    const characterMetadata = await sharp(characterBuffer).metadata();
    const charWidth = characterMetadata.width;
    const charHeight = characterMetadata.height;
    console.log(`[API] Character dimensions: ${charWidth}x${charHeight}`);

    // Calculate scaled character dimensions
    const scaledWidth = Math.round(charWidth * scale);
    const scaledHeight = Math.round(charHeight * scale);
    console.log(
      `[API] Scaled character: ${scaledWidth}x${scaledHeight}, scale factor: ${scale}`
    );

    // Process character: resize and get raw data
    const processedCharacter = await sharp(characterBuffer)
      .resize(scaledWidth, scaledHeight)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data: charData, info: charInfo } = processedCharacter;

    let newData;

    if (mode === "photo" && colorR && colorG && colorB) {
      // Photo mode: color-based removal
      const targetColor = {
        r: parseInt(colorR),
        g: parseInt(colorG),
        b: parseInt(colorB),
      };
      console.log(
        `[API] Removing background with color-based removal: RGB(${targetColor.r}, ${targetColor.g}, ${targetColor.b}), tolerance: ${colorTolerance}`
      );

      newData = colorBasedRemoveBackground(
        charData,
        charInfo.width,
        charInfo.height,
        targetColor,
        colorTolerance
      );
    } else {
      // Sketch mode: flood fill from edges
      console.log(
        `[API] Removing background with flood fill, threshold: ${threshold}`
      );

      newData = floodFillRemoveBackground(
        charData,
        charInfo.width,
        charInfo.height,
        threshold
      );
    }

    // Convert back to PNG with transparency
    const transparentCharacter = await sharp(newData, {
      raw: {
        width: charInfo.width,
        height: charInfo.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    console.log("[API] Background removed from character (flood fill)");

    // Clamp position to valid range
    const posX = Math.max(0, Math.min(x, mangaWidth - scaledWidth));
    const posY = Math.max(0, Math.min(y, mangaHeight - scaledHeight));
    console.log(`[API] Compositing at position: (${posX}, ${posY})`);

    // Composite character onto manga
    const finalImage = await sharp(mangaBuffer)
      .composite([
        {
          input: transparentCharacter,
          left: posX,
          top: posY,
        },
      ])
      .png()
      .toBuffer();

    console.log("[API] Compositing complete");

    return new NextResponse(finalImage, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error("[API] Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
