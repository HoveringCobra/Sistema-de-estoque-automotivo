
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const veiculoId = Number(id);

  const statusPermitidos = [
    "Disponível",
    "Reservado",
    "Vendido",
  ];

  if (!Number.isInteger(veiculoId) || veiculoId <= 0) {
    return Response.json(
      { erro: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const { status } = await request.json();

    if (!statusPermitidos.includes(status)) {
      return Response.json(
        { erro: "Status inválido" },
        { status: 400 }
      );
    }

    const resultado = await pool.query(
      `UPDATE veiculos
       SET status = $1
       WHERE id = $2
       RETURNING id, status`,
      [status, veiculoId]
    );

    if (resultado.rowCount === 0) {
      return Response.json(
        { erro: "Veículo não encontrado" },
        { status: 404 }
      );
    }

    return Response.json({
      mensagem: "Status atualizado com sucesso!",
      veiculo: resultado.rows[0],
    });

  } catch (erro) {
    console.error("Erro ao atualizar status:", erro);

    return Response.json(
      { erro: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}
