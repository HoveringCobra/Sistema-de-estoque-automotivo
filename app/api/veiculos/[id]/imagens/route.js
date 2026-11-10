
import pool from "@/lib/db";

export async function POST(request, { params }) {
    const { id } = await params;

    const veiculoId = Number(id);

    if (!Number.isInteger(veiculoId) || veiculoId <= 0) {
        return Response.json(
            { erro: "ID do veículo inválido" },
            { status: 400 }
        );
    }

    let client;

    try {
        const { imagens } = await request.json();

        if (
            !Array.isArray(imagens) ||
            imagens.length < 1 ||
            imagens.length > 8 ||
            !imagens.every(
                (imagem) =>
                    typeof imagem === "string" &&
                    /^\/imagem-carros\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(imagem)
            ) ||
            new Set(imagens).size !== imagens.length
        ) {
            return Response.json(
                { erro: "Envie de 1 a 8 imagens válidas" },
                { status: 400 }
            );
        }

        client = await pool.connect();

        await client.query("BEGIN");


        const veiculo = await client.query(
            "SELECT id FROM veiculos WHERE id = $1 FOR UPDATE",
            [veiculoId]
        );

        if (veiculo.rowCount === 0) {
            await client.query("ROLLBACK");

            return Response.json(
                { erro: "Veículo não encontrado" },
                { status: 404 }
            );
        }


        const resultado = await client.query(
            `SELECT COALESCE(MAX(ordem), 0) AS ultima_ordem,
              COUNT(*)::int AS total
       FROM veiculo_imagens
       WHERE veiculo_id = $1`,
            [veiculoId]
        );

        const total = resultado.rows[0].total;
        const ultimaOrdem = Number(
            resultado.rows[0].ultima_ordem
        );

        if (total + imagens.length > 8) {
            await client.query("ROLLBACK");

            return Response.json(
                {
                    erro: `Este veículo já possui ${total} fotos. 
                 Você pode adicionar no máximo ${8 - total}.`,
                },
                { status: 400 }
            );
        }

        if (ultimaOrdem + imagens.length > 8) {
            await client.query("ROLLBACK");

            return Response.json(
                {
                    erro: "Não há posições disponíveis para essas fotos.",
                },
                { status: 400 }
            );
        }


        for (let i = 0; i < imagens.length; i++) {
            await client.query(
                `INSERT INTO veiculo_imagens
         (veiculo_id, caminho_imagem, ordem)
         VALUES ($1, $2, $3)`,
                [veiculoId, imagens[i], ultimaOrdem + i + 1]
            );
        }

        await client.query("COMMIT");

        return Response.json(
            {
                mensagem: "Fotos adicionadas com sucesso!",
                total: total + imagens.length,
            },
            { status: 201 }
        );

    } catch (erro) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error("Erro ao adicionar fotos:", erro);

        return Response.json(
            { erro: "Erro ao adicionar fotos" },
            { status: 500 }
        );

    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const veiculoId = Number(id);

    if (!Number.isInteger(veiculoId) || veiculoId <= 0) {
        return Response.json(
            { erro: "ID do veículo inválido" },
            { status: 400 }
        );
    }

    let client;

    try {
        const { imagem } = await request.json();

        if (
            typeof imagem !== "string" ||
            !/^\/imagem-carros\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(imagem)
        ) {
            return Response.json(
                { erro: "Imagem inválida" },
                { status: 400 }
            );
        }

        client = await pool.connect();
        await client.query("BEGIN");

        const veiculo = await client.query(
            "SELECT id FROM veiculos WHERE id = $1 FOR UPDATE",
            [veiculoId]
        );

        if (veiculo.rowCount === 0) {
            await client.query("ROLLBACK");

            return Response.json(
                { erro: "Veículo não encontrado" },
                { status: 404 }
            );
        }


        const resultado = await client.query(
            `DELETE FROM veiculo_imagens
       WHERE veiculo_id = $1 AND caminho_imagem = $2
       RETURNING id`,
            [veiculoId, imagem]
        );

        if (resultado.rowCount === 0) {
            await client.query("ROLLBACK");

            return Response.json(
                { erro: "Foto não encontrada neste veículo" },
                { status: 404 }
            );
        }


        await client.query(
            `WITH fotos_ordenadas AS (
         SELECT id,
                ROW_NUMBER() OVER (
                  ORDER BY ordem, id
                )::integer AS nova_ordem
         FROM veiculo_imagens
         WHERE veiculo_id = $1
       )
       UPDATE veiculo_imagens AS foto
       SET ordem = fotos_ordenadas.nova_ordem
       FROM fotos_ordenadas
       WHERE foto.id = fotos_ordenadas.id`,
            [veiculoId]
        );

        await client.query("COMMIT");

        return Response.json({
            mensagem: "Foto excluída com sucesso!",
        });

    } catch (erro) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error("Erro ao excluir foto:", erro);

        return Response.json(
            { erro: "Erro ao excluir foto" },
            { status: 500 }
        );

    } finally {
        if (client) client.release();
    }
}


export async function PATCH(request, { params }) {
    const { id } = await params;
    const veiculoId = Number(id);

    if (!Number.isInteger(veiculoId) || veiculoId <= 0) {
        return Response.json(
            { erro: "ID do veículo inválido" },
            { status: 400 }
        );
    }

    let client;

    try {
        const { imagem } = await request.json();

        if (
            typeof imagem !== "string" ||
            !/^\/imagem-carros\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(imagem)
        ) {
            return Response.json(
                { erro: "Imagem inválida" },
                { status: 400 }
            );
        }

        client = await pool.connect();
        await client.query("BEGIN");

        const veiculo = await client.query(
            "SELECT id FROM veiculos WHERE id = $1 FOR UPDATE",
            [veiculoId]
        );

        if (veiculo.rowCount === 0) {
            await client.query("ROLLBACK");

            return Response.json(
                { erro: "Veículo não encontrado" },
                { status: 404 }
            );
        }

        const resultado = await client.query(
            `SELECT id, caminho_imagem
       FROM veiculo_imagens
       WHERE veiculo_id = $1
       ORDER BY ordem, id`,
            [veiculoId]
        );

        const fotos = resultado.rows;

        const indice = fotos.findIndex(
            (foto) => foto.caminho_imagem === imagem
        );

        if (indice === -1) {
            await client.query("ROLLBACK");

            return Response.json(
                { erro: "Foto não encontrada neste veículo" },
                { status: 404 }
            );
        }


        const [capa] = fotos.splice(indice, 1);
        fotos.unshift(capa);


        await client.query(
            "DELETE FROM veiculo_imagens WHERE veiculo_id = $1",
            [veiculoId]
        );

        // Recriar as fotos na nova ordem
        for (let i = 0; i < fotos.length; i++) {
            await client.query(
                `INSERT INTO veiculo_imagens
     (veiculo_id, caminho_imagem, ordem)
     VALUES ($1, $2, $3)`,
                [veiculoId, fotos[i].caminho_imagem, i + 1]
            );
        }

        await client.query("COMMIT");

        return Response.json({
            mensagem: "Foto de capa atualizada com sucesso!",
            imagens: fotos.map((foto) => foto.caminho_imagem),
        });

    } catch (erro) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error("Erro ao alterar capa:", erro);

        return Response.json(
            { erro: "Erro ao alterar foto de capa" },
            { status: 500 }
        );

    } finally {
        if (client) client.release();
    }
}
