
export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const [mimeTypePart, dataPart] = base64String.split(';base64,');
      if (!dataPart) {
        reject(new Error("Invalid base64 string generated from file."));
        return;
      }
      const mimeType = mimeTypePart.split(':')[1];
      resolve({ base64: dataPart, mimeType });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function base64ToDataURL(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}
