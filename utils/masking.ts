export interface Detection {
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

/**
 * Converts a File object to a Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a mask image from bounding box detections
 */
export function createMaskBase64(
  imageFile: File,
  detections: Detection[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Fill the entire canvas with black
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw white rectangles for each detection with padding
      ctx.fillStyle = "white";
      const padding = 10;

      for (const detection of detections) {
        const { xmin, ymin, xmax, ymax } = detection.box;
        const x = Math.max(0, xmin - padding);
        const y = Math.max(0, ymin - padding);
        const width = Math.min(canvas.width - x, xmax - xmin + padding * 2);
        const height = Math.min(canvas.height - y, ymax - ymin + padding * 2);

        ctx.fillRect(x, y, width, height);
      }

      // Convert canvas to base64
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];

      URL.revokeObjectURL(url);
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

