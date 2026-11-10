
import pool from "@/lib/db";

export async function GET() {
  try {
    const resultado = await pool.query(`
      SELECT
        COUNT(*)::int AS total,

        COUNT(*) FILTER (
          WHERE status = 'Disponível'
        )::int AS disponiveis,

        COUNT(*) FILTER (
          WHERE status = 'Reservado'
        )::int AS reservados,

        COUNT(*) FILTER (
          WHERE status = 'Vendido'
        )::int AS vendidos,

        COALESCE(
          SUM(preco) FILTER (
            WHERE status = 'Disponível'
          ), 0
        ) AS valor_estoque

      FROM veiculos
    `);

    return Response.json(resultado.rows[0]);

  } catch (erro) {
    console.error("Erro no dashboard:", erro);

    return Response.json(
      { erro: "Erro ao carregar estatísticas" },
      { status: 500 }
    );
  }
}
