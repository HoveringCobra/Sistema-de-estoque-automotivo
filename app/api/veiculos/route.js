import pool from "@/lib/db";

export async function GET() {
  try {
    const resultado = await pool.query(
      "SELECT * FROM veiculos ORDER BY id"
    );

    return Response.json(resultado.rows);

  } catch (erro) {
    console.error("Erro ao buscar veículos:", erro);

    return Response.json(
      { erro: "Erro ao buscar veículos" },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const { marca, modelo, ano, placa, preco } =
      await request.json();

    if (!marca || !modelo || !ano || !placa || !preco) {
      return Response.json(
        { erro: "Preencha todos os campos" },
        { status: 400 }
      );
    }

    const resultado = await pool.query(
      `INSERT INTO veiculos
       (marca, modelo, ano, placa, preco)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [marca, modelo, ano, placa, preco]
    );

    return Response.json(resultado.rows[0], {
      status: 201,
    });

  } catch (erro) {
    console.error("Erro ao cadastrar veículo:", erro);

    return Response.json(
      { erro: "Erro ao cadastrar veículo" },
      { status: 500 }
    );
  }
}
