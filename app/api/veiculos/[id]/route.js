
import pool from "@/lib/db";

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


export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { marca, modelo, ano, placa, preco } =
      await request.json();

    if (!marca || !modelo || !ano || !placa || !preco) {
      return Response.json(
        { erro: "Preencha todos os campos" },
        { status: 400 }
      );
    }

    const resultado = await pool.query(
      `UPDATE veiculos
       SET marca = $1,
           modelo = $2,
           ano = $3,
           placa = $4,
           preco = $5
       WHERE id = $6
       RETURNING *`,
      [marca, modelo, ano, placa, preco, id]
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
