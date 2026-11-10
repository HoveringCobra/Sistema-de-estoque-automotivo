
import pool from "@/lib/db";


// Funcao de Deletar

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const resultado = await pool.query(
      "DELETE FROM veiculos WHERE id = $1 RETURNING id",
      [id]
    );

    if (resultado.rowCount === 0) {
      return Response.json(
        { erro: "Veículo não encontrado" },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });

  } catch (erro) {
    console.error("Erro ao excluir veículo:", erro);

    return Response.json(
      { erro: "Erro ao excluir veículo" },
      { status: 500 }
    );
  }
}

// Funcao de Editar top

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

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
    } = await request.json();

    if (!marca || !modelo || !ano || !placa || !preco) {
      return Response.json(
        { erro: "Preencha os campos obrigatórios" },
        { status: 400 }
      );
    }

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

    const resultado = await pool.query(
      `
      UPDATE veiculos
      SET
        marca = $1,
        modelo = $2,
        ano = $3,
        placa = $4,
        preco = $5,
        quilometragem = $6,
        motorizacao = $7,
        combustivel = $8,
        cambio = $9,
        cor = $10,
        potencia = $11,
        descricao = $12
      WHERE id = $13
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
        id,
      ]
    );

    if (resultado.rowCount === 0) {
      return Response.json(
        { erro: "Veículo não encontrado" },
        { status: 404 }
      );
    }

    return Response.json(resultado.rows[0]);

  } catch (erro) {
    console.error("Erro ao editar veículo:", erro);

    if (erro.code === "23505") {
      return Response.json(
        { erro: "Esta placa já está cadastrada" },
        { status: 409 }
      );
    }

    return Response.json(
      { erro: "Erro ao editar veículo" },
      { status: 500 }
    );
  }
}