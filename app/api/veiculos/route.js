
import pool from "@/lib/db";

// =====================================
// GET - LISTAR VEÍCULOS
// =====================================

export async function GET() {
  try {
    const resultado = await pool.query(`
      SELECT
        v.id,
        v.marca,
        v.modelo,
        v.ano,
        v.placa,
        v.preco,
        v.status,
        v.quilometragem,
        v.motorizacao,
        v.combustivel,
        v.cambio,
        v.cor,
        v.potencia,
        v.descricao,
        COALESCE(
          json_agg(
            i.caminho_imagem
            ORDER BY i.ordem
          ) FILTER (
            WHERE i.id IS NOT NULL
          ),
          '[]'::json
        ) AS imagens
      FROM veiculos v
      LEFT JOIN veiculo_imagens i
        ON v.id = i.veiculo_id
      GROUP BY v.id
      ORDER BY v.id DESC
    `);

    return Response.json(resultado.rows);

  } catch (erro) {
    console.error("Erro ao buscar veículos:", erro);

    return Response.json(
      { erro: "Erro ao buscar veículos" },
      { status: 500 }
    );
  }
}

// =====================================
// POST - CADASTRAR VEÍCULO
// =====================================

export async function POST(request) {
  let client;

  try {
    const {
      marca,
      modelo,
      ano,
      placa,
      preco,
      quilometragem,
      motorizacao,
      combustivel,
      cambio,
      cor,
      potencia,
      descricao,
      imagens = [],
    } = await request.json();

   // compos obrigatorios
    if (
      !marca ||
      !modelo ||
      !ano ||
      !placa ||
      !preco
    ) {
      return Response.json(
        { erro: "Preencha os campos obrigatórios" },
        { status: 400 }
      );
    }

    // fotos
    if (
      !Array.isArray(imagens) ||
      imagens.length > 8 ||
      !imagens.every(
        (imagem) =>
          typeof imagem === "string" &&
          /^\/imagem-carros\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(imagem)
      ) ||
      new Set(imagens).size !== imagens.length
    ) {
      return Response.json(
        {
          erro: "Lista de imagens inválida. Máximo de 8 fotos.",
        },
        { status: 400 }
      );
    }

    // campos opcionais
    const km =
      quilometragem === "" ||
      quilometragem === null ||
      quilometragem === undefined
        ? null
        : Number(quilometragem);

    const cv =
      potencia === "" ||
      potencia === null ||
      potencia === undefined
        ? null
        : Number(potencia);

    if (
      (km !== null &&
        (!Number.isInteger(km) || km < 0)) ||
      (cv !== null &&
        (!Number.isInteger(cv) || cv < 0))
    ) {
      return Response.json(
        {
          erro: "Quilometragem e potência devem ser números inteiros válidos.",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Cadastro de  veículo
    const resultado = await client.query(
      `
      INSERT INTO veiculos (
        marca,
        modelo,
        ano,
        placa,
        preco,
        quilometragem,
        motorizacao,
        combustivel,
        cambio,
        cor,
        potencia,
        descricao
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )
      RETURNING *
      `,
      [
        marca,
        modelo,
        ano,
        placa.trim().toUpperCase(),
        preco,
        km,
        motorizacao || null,
        combustivel || null,
        cambio || null,
        cor || null,
        cv,
        descricao || null,
      ]
    );

    const veiculo = resultado.rows[0];

    // Salvamento de fotos de veículo
    for (let i = 0; i < imagens.length; i++) {
      await client.query(
        `
        INSERT INTO veiculo_imagens (
          veiculo_id,
          caminho_imagem,
          ordem
        )
        VALUES ($1, $2, $3)
        `,
        [
          veiculo.id,
          imagens[i],
          i + 1,
        ]
      );
    }

    await client.query("COMMIT");

    return Response.json(
      {
        mensagem: "Veículo cadastrado com sucesso!",
        veiculo,
        imagens,
      },
      { status: 201 }
    );

  } catch (erro) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Erro ao cadastrar veículo:", erro);

    if (erro.code === "23505") {
      return Response.json(
        { erro: "Esta placa já está cadastrada" },
        { status: 409 }
      );
    }

    return Response.json(
      { erro: "Erro ao cadastrar veículo" },
      { status: 500 }
    );

  } finally {
    if (client) {
      client.release();
    }
  }
}
