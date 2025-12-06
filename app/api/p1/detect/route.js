import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";
import sharp from "sharp";

export async function POST(request) {
  try {
    console.log("[API] Detection request received");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const client = new ImageAnnotatorClient({
      keyFilename: path.join(process.cwd(), "google-credentials.json"),
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const metadata = await sharp(buffer).metadata();
    const imageWidth = metadata.width;
    const imageHeight = metadata.height;
    console.log(`[API] Image dimensions: ${imageWidth}x${imageHeight}`);

    const [textResult] = await client.textDetection(buffer);
    const [documentResult] = await client.documentTextDetection(buffer);
    const [logoResult] = await client.logoDetection(buffer);
    const [objectResult] = await client.objectLocalization(buffer);

    let detections = [];
    const TEXT_EXPAND = 12;
    const LOGO_EXPAND = 25;
    const OBJ_EXPAND = 20;

    const textAnnotations = textResult.textAnnotations;
    if (textAnnotations && textAnnotations.length > 1) {
      console.log(`[API] Found ${textAnnotations.length - 1} text blocks`);

      for (let i = 1; i < textAnnotations.length; i++) {
        const annotation = textAnnotations[i];
        const vertices = annotation.boundingPoly.vertices;
        const xValues = vertices.map((v) => v.x || 0);
        const yValues = vertices.map((v) => v.y || 0);

        detections.push({
          score: 1.0,
          label: "text",
          box: {
            xmin: Math.max(0, Math.min(...xValues) - TEXT_EXPAND),
            ymin: Math.max(0, Math.min(...yValues) - TEXT_EXPAND),
            xmax: Math.min(imageWidth, Math.max(...xValues) + TEXT_EXPAND),
            ymax: Math.min(imageHeight, Math.max(...yValues) + TEXT_EXPAND),
          },
        });
      }
    }

    const fullTextAnnotation = documentResult.fullTextAnnotation;
    if (fullTextAnnotation && fullTextAnnotation.pages) {
      let blockCount = 0;
      for (const page of fullTextAnnotation.pages) {
        for (const block of page.blocks || []) {
          if (block.boundingBox && block.boundingBox.vertices) {
            const vertices = block.boundingBox.vertices;
            const xValues = vertices.map((v) => v.x || 0);
            const yValues = vertices.map((v) => v.y || 0);

            detections.push({
              score: block.confidence || 1.0,
              label: "document_text",
              box: {
                xmin: Math.max(0, Math.min(...xValues) - TEXT_EXPAND),
                ymin: Math.max(0, Math.min(...yValues) - TEXT_EXPAND),
                xmax: Math.min(imageWidth, Math.max(...xValues) + TEXT_EXPAND),
                ymax: Math.min(imageHeight, Math.max(...yValues) + TEXT_EXPAND),
              },
            });
            blockCount++;
          }
        }
      }
      if (blockCount > 0) {
        console.log(`[API] Found ${blockCount} document text blocks`);
      }
    }

    const logoAnnotations = logoResult.logoAnnotations;
    if (logoAnnotations && logoAnnotations.length > 0) {
      console.log(`[API] Found ${logoAnnotations.length} logos/brands`);

      for (const logo of logoAnnotations) {
        const vertices = logo.boundingPoly.vertices;
        const xValues = vertices.map((v) => v.x || 0);
        const yValues = vertices.map((v) => v.y || 0);

        detections.push({
          score: logo.score || 1.0,
          label: "logo",
          box: {
            xmin: Math.max(0, Math.min(...xValues) - LOGO_EXPAND),
            ymin: Math.max(0, Math.min(...yValues) - LOGO_EXPAND),
            xmax: Math.min(imageWidth, Math.max(...xValues) + LOGO_EXPAND),
            ymax: Math.min(imageHeight, Math.max(...yValues) + LOGO_EXPAND),
          },
        });
      }
    }

    const relevantObjectLabels = [
      "sign",
      "signs",
      "signage",
      "signboard",
      "signboards",
      "billboard",
      "billboards",
      "hoarding",
      "hoardings",
      "advertisement",
      "advertisements",
      "advertising",
      "ad",
      "ads",
      "poster",
      "posters",
      "banner",
      "banners",
      "flex",
      "flexboard",
      "display",
      "displays",
      "board",
      "boards",
      "placard",
      "placards",
      "notice",
      "notices",
      "notification",
      "screen",
      "screens",
      "monitor",
      "monitors",
      "tv",
      "television",
      "store",
      "stores",
      "shop",
      "shops",
      "storefront",
      "storefronts",
      "retail",
      "retailer",
      "outlet",
      "mall",
      "market",
      "awning",
      "awnings",
      "canopy",
      "canopies",
      "shade",
      "shades",
      "marquee",
      "marquees",
      "fascia",
      "facade",
      "neon",
      "led",
      "electronic",
      "digital",
      "backlit",
      "lightbox",
      "nameplate",
      "nameplates",
      "plaque",
      "plaques",
      "menu",
      "menus",
      "price",
      "prices",
      "pricelist",
      "rate",
      "rates",
      "tag",
      "tags",
      "label",
      "labels",
      "sticker",
      "stickers",
      "decal",
      "decals",
      "vinyl",
      "graphics",
      "graphic",
      "flag",
      "flags",
      "pennant",
      "pennants",
      "streamer",
      "streamers",
      "text",
      "letter",
      "letters",
      "word",
      "words",
      "writing",
      "number",
      "numbers",
      "numeral",
      "numerals",
      "logo",
      "logos",
      "brand",
      "brands",
      "trademark",
      "trademarks",
      "symbol",
      "symbols",
      "icon",
      "icons",
      "emblem",
      "emblems",
      "company",
      "corporate",
      "business",
      "commercial",
      "window",
      "windows",
      "door",
      "doors",
      "entrance",
      "entry",
      "booth",
      "kiosk",
      "stand",
      "stall",
      "cart",
      "vendor",
      "pole",
      "post",
      "pillar",
      "column",
      "frame",
      "frames",
      "panel",
      "panels",
      "wall",
      "walls",
      "surface",
      "surfaces",
      "paint",
      "painted",
      "painting",
      "mural",
      "murals",
      "graffiti",
      "street art",
      "wall art",
      "product",
      "products",
      "merchandise",
      "goods",
      "offer",
      "sale",
      "discount",
      "promo",
      "promotion",
      "deal",
      "open",
      "closed",
      "hours",
      "timing",
      "schedule",
      "phone",
      "telephone",
      "contact",
      "address",
      "location",
      "arrow",
      "arrows",
      "direction",
      "directions",
      "pointing",
      "parking",
      "toilet",
      "restroom",
      "exit",
      "entrance",
      "warning",
      "caution",
      "danger",
      "safety",
      "emergency",
      "information",
      "info",
      "help",
      "guide",
      "map",
    ];

    const localizedObjects = objectResult.localizedObjectAnnotations || [];
    if (localizedObjects.length > 0) {
      console.log(`[API] Found ${localizedObjects.length} objects`);

      for (const obj of localizedObjects) {
        const label = obj.name.toLowerCase();

        if (relevantObjectLabels.some((relevant) => label.includes(relevant))) {
          const vertices = obj.boundingPoly.normalizedVertices;
          const xValues = vertices.map((v) => (v.x || 0) * imageWidth);
          const yValues = vertices.map((v) => (v.y || 0) * imageHeight);

          detections.push({
            score: obj.score || 1.0,
            label: obj.name,
            box: {
              xmin: Math.max(0, Math.min(...xValues) - OBJ_EXPAND),
              ymin: Math.max(0, Math.min(...yValues) - OBJ_EXPAND),
              xmax: Math.min(imageWidth, Math.max(...xValues) + OBJ_EXPAND),
              ymax: Math.min(imageHeight, Math.max(...yValues) + OBJ_EXPAND),
            },
          });
        }
      }
    }

    console.log(`[API] Total detections: ${detections.length}`);
    return Response.json({ detections });
  } catch (error) {
    console.error("[API] Detection Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
