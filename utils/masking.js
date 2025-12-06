/**
 * Converts a File object to a Base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a mask image from bounding box detections
 * @param {File} imageFile - The original image file
 * @param {Array} detections - Array of detection objects with box property containing xmin, ymin, xmax, ymax
 * @returns {Promise<string>} - Base64 encoded mask image
 */
export function createMaskBase64(imageFile, detections) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

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
