import fs from "fs/promises";
import path from "path";

export async function uploadImage(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Garantir que a pasta exista
    await fs.mkdir(uploadDir, { recursive: true });

    // Obter extensão e gerar nome único
    const ext = path.extname(file.name) || ".jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    await fs.writeFile(filePath, buffer);
    
    return `/uploads/${uniqueName}`;
  } catch (error) {
    console.error("Erro no upload do arquivo:", error);
    throw new Error("Falha ao salvar a imagem no servidor.");
  }
}
