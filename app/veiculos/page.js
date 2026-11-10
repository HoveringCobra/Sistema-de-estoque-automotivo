
"use client";

// Lista de Veículos 

import Link from "next/link";
import { useState, useEffect } from "react";
import GaleriaVeiculos from "@/components/GaleriaVeiculos";

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function buscarVeiculos() {
      try {
        const resposta = await fetch("/api/veiculos");

        if (!resposta.ok) {
          throw new Error("Erro ao buscar veículos");
        }

        const dados = await resposta.json();
        setVeiculos(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    buscarVeiculos();
  }, []);

  async function excluirVeiculo(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este veículo?"
    );

    if (!confirmar) return;

    try {
      const resposta = await fetch(`/api/veiculos/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir veículo");
      }

      setVeiculos((lista) =>
        lista.filter((veiculo) => veiculo.id !== id)
      );
    } catch (erro) {
      setErro(erro.message);
    }
  }

  const veiculosFiltrados = veiculos.filter((veiculo) => {
    const nome = `${veiculo.marca} ${veiculo.modelo}`.toLowerCase();

    return nome.includes(busca.toLowerCase());
  });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Estoque de Veículos</h1>
          <p className="text-muted">
            Gerencie os veículos cadastrados no AutoManager.
          </p>
        </div>

        <Link href="/cadastrar" className="btn btn-primary">
          + Cadastrar Veículo
        </Link>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Pesquisar por marca ou modelo..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
      </div>

      {carregando && <p>Carregando veículos...</p>}

      {erro && (
        <div className="alert alert-danger">{erro}</div>
      )}

      {!carregando && !erro && (
        <>
          <p className="text-muted">
            {veiculosFiltrados.length} veículos encontrados
          </p>

          <div className="row g-4">
            {veiculosFiltrados.map((veiculo) => (
              <div
                className="col-md-6 col-xl-4"
                key={veiculo.id}
              >
                <div className="card carro-card h-100">
                  <GaleriaVeiculos
                    imagens={veiculo.imagens}
                    nome={`${veiculo.marca} ${veiculo.modelo}`}
                  />

                  <div className="card-body">
                    <small className="carro-marca">
                      {veiculo.marca}
                    </small>

                    <Link
                      href={`/veiculos/${veiculo.id}/detalhes`}
                      className="text-decoration-none"
                    >
                      <h5 className="carro-modelo">
                        {veiculo.modelo}
                      </h5>
                    </Link>

                    <div className="mb-2">
                      <span
                        className={`veiculo-status ${veiculo.status === "Disponível"
                          ? "status-disponivel"
                          : veiculo.status === "Reservado"
                            ? "status-reservado"
                            : veiculo.status === "Vendido"
                              ? "status-vendido"
                              : "status-desconhecido"
                          }`}
                      >
                        {veiculo.status || "Status não informado"}
                      </span>
                    </div>

                    <p className="carro-detalhes">
                      📅 {veiculo.ano}
                      <span className="ms-3">
                        🚘 {veiculo.placa}
                      </span>
                    </p>

                    <hr />

                    <small className="text-muted">
                      Preço de venda
                    </small>

                    <h4 className="carro-preco">
                      {Number(veiculo.preco).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}
                    </h4>

                    <Link
                      href={`/veiculos/${veiculo.id}/detalhes`}
                      className="btn btn-outline-secondary flex-fill"
                    >
                      Detalhes
                    </Link>

                    <div className="d-flex gap-2 mt-3">
                      <Link
                        href={`/veiculos/${veiculo.id}`}
                        className="btn btn-warning flex-fill"
                      >
                        Editar
                      </Link>

                      <button
                        className="btn btn-danger flex-fill"
                        onClick={() =>
                          excluirVeiculo(veiculo.id)
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {veiculosFiltrados.length === 0 && (
            <p className="text-center mt-4">
              Nenhum veículo encontrado.
            </p>
          )}
        </>
      )}
    </div>
  );
}
