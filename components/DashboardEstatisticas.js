
"use client";

import { useEffect, useState } from "react";

export default function DashboardEstatisticas() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscarEstatisticas() {
      try {
        const resposta = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (!resposta.ok) {
          throw new Error("Erro ao carregar dashboard");
        }

        const resultado = await resposta.json();
        setDados(resultado);

      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    buscarEstatisticas();
  }, []);

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (carregando) {
    return <p>Carregando estatísticas...</p>;
  }

  if (erro) {
    return (
      <div className="alert alert-danger">
        {erro}
      </div>
    );
  }

  if (!dados) return null;

  const estatisticas = [
    {
      titulo: "Total de veículos",
      valor: dados.total,
      icone: "🚗",
      cor: "total",
    },
    {
      titulo: "Disponíveis",
      valor: dados.disponiveis,
      icone: "✅",
      cor: "disponivel",
    },
    {
      titulo: "Reservados",
      valor: dados.reservados,
      icone: "🕒",
      cor: "reservado",
    },
    {
      titulo: "Vendidos",
      valor: dados.vendidos,
      icone: "🏁",
      cor: "vendido",
    },
  ];

  return (
    <section className="dashboard-estatisticas">
      <div className="dashboard-titulo">
        <h2>Visão geral do estoque</h2>
        <p>Acompanhe a situação dos seus veículos.</p>
      </div>

      <div className="row g-3">
        {estatisticas.map((item) => (
          <div
            className="col-sm-6 col-xl-3"
            key={item.titulo}
          >
            <div className="dashboard-card">
              <div className="dashboard-card-topo">
                <span>{item.titulo}</span>

                <div
                  className={`dashboard-icone dashboard-${item.cor}`}
                >
                  {item.icone}
                </div>
              </div>

              <h3>{item.valor}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-valor">
        <div>
          <p>Valor total dos veículos disponíveis</p>

          <h2>
            {formatarMoeda(dados.valor_estoque)}
          </h2>

          <small>
            Soma dos preços de venda do estoque disponível
          </small>
        </div>

        <div className="dashboard-valor-icone">
          💰
        </div>
      </div>
    </section>
  );
}
