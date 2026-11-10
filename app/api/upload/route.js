
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";


export async function POST(request) {
  const arquivosSalvos = [];

  try {
    const dados = await request.formData();
    const imagens = dados.getAll("imagens");


    if (imagens.length < 1 || imagens.length > 8) {
      return Response.json(
        { erro: "Selecione de 1 a 8 fotos" },
        { status: 400 }
      );
    }

    const tiposPermitidos = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    
    for (const imagem of imagens) {
      if (
        !imagem ||
        typeof imagem === "string" ||
        typeof imagem.arrayBuffer !== "function"
      ) {
        return Response.json(
          { erro: "Arquivo inválido" },
          { status: 400 }
        );
      }

      if (!tiposPermitidos[imagem.type]) {
        return Response.json(
          { erro: "Use apenas JPG, PNG ou WebP" },
          { status: 400 }
        );
      }

      if (
        imagem.size === 0 ||
        imagem.size > 5 * 1024 * 1024
      ) {
        return Response.json(
          { erro: "Cada foto deve ter até 5 MB" },
          { status: 400 }
        );
      }
    }

    const pasta = path.join(
      process.cwd(),
      "public",
      "imagem-carros"
    );

    await mkdir(pasta, { recursive: true });

    const caminhos = [];

    for (const imagem of imagens) {
      const extensao = tiposPermitidos[imagem.type];
      const nome = randomUUID() + extensao;

      const buffer = Buffer.from(
        await imagem.arrayBuffer()
      );

      
      const jpg =
        imagem.type === "image/jpeg" &&
        buffer.subarray(0, 3).equals(
          Buffer.from([0xff, 0xd8, 0xff])
        );

      const png =
        imagem.type === "image/png" &&
        buffer.subarray(0, 8).equals(
          Buffer.from([
            137, 80, 78, 71, 13, 10, 26, 10
          ])
        );

      const webp =
        imagem.type === "image/webp" &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";

      if (!jpg && !png && !webp) {
        throw new Error("Formato real da imagem inválido");
      }

      const destino = path.join(pasta, nome);

      await writeFile(destino, buffer);

      arquivosSalvos.push(destino);
      caminhos.push(`/imagem-carros/${nome}`);
    }

    return Response.json(
      {
        mensagem: "Fotos enviadas com sucesso!",
        imagens: caminhos,
      },
      { status: 201 }
    );

  } catch (erro) {
    
    await Promise.allSettled(
      arquivosSalvos.map((arquivo) => unlink(arquivo))
    );

    console.error("Erro no upload:", erro);

    return Response.json(
      { erro: "Não foi possível salvar as fotos" },
      { status: 500 }
    );
  }
}