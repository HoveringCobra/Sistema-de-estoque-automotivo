
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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

      setVeiculos((listaAtual) =>
        listaAtual.filter((veiculo) => veiculo.id !== id)
      );

    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="container-fluid">
      <h1>Estoque de Veículos</h1>
      <p>Veículos cadastrados no AutoManager.</p>

      {carregando && <p>Carregando veículos...</p>}

      {erro && (
        <div className="alert alert-danger">
          {erro}
        </div>
      )}

      {!carregando && !erro && (
        <div className="card shadow-sm">
          <div className="card-body">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Ano</th>
                  <th>Placa</th>
                  <th>Preço</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id}>
                    <td>{veiculo.id}</td>
                    <td>{veiculo.marca}</td>
                    <td>{veiculo.modelo}</td>
                    <td>{veiculo.ano}</td>
                    <td>{veiculo.placa}</td>
                    <td>
                      {Number(veiculo.preco).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          href={`/veiculos/${veiculo.id}`}
                          className="btn btn-warning btn-sm"
                        >
                          Editar
                        </Link>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => excluirVeiculo(veiculo.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {veiculos.length === 0 && (
              <p className="text-center">
                Nenhum veículo cadastrado.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
