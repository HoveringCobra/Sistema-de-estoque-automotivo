
"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import GaleriaVeiculos from "@/components/GaleriaVeiculos";

function DetalhesVeiculo(){
  const { id } = useParams();

  const [veiculo, setVeiculo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarVeiculo() {
      try {
        const resposta = await fetch("/api/veiculos");

        if (!resposta.ok) {
          throw new Error("Erro ao buscar veículos.");
        }

        const dados = await resposta.json();

        const encontrado = dados.find(
          (item) => String(item.id) === String(id)
        );

        if (!encontrado) {
          throw new Error("Veículo não encontrado.");
        }

        setVeiculo(encontrado);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    if (id) {
      carregarVeiculo();
    }
  }, [id]);

  function mostrar(valor, sufixo = "") {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "Não informado";
    }

    return `${valor}${sufixo}`;
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (carregando) {
    return <p>Carregando informações do veículo...</p>;
  }

  if (erro) {
    return (
      <div className="alert alert-danger">
        {erro}
        <div className="mt-3">
          <Link href="/veiculos">Voltar ao estoque</Link>
        </div>
      </div>
    );
  }

  if (!veiculo) return null;

  const informacoes = [
    {
      titulo: "Marca",
      valor: mostrar(veiculo.marca),
    },
    {
      titulo: "Modelo",
      valor: mostrar(veiculo.modelo),
    },
    {
      titulo: "Ano",
      valor: mostrar(veiculo.ano),
    },
    {
      titulo: "Placa",
      valor: mostrar(veiculo.placa),
    },
    {
      titulo: "Quilometragem",
      valor:
        veiculo.quilometragem != null
          ? `${Number(veiculo.quilometragem).toLocaleString("pt-BR")} km`
          : "Não informado",
    },
    {
      titulo: "Motorização",
      valor: mostrar(veiculo.motorizacao),
    },
    {
      titulo: "Combustível",
      valor: mostrar(veiculo.combustivel),
    },
    {
      titulo: "Câmbio",
      valor: mostrar(veiculo.cambio),
    },
    {
      titulo: "Cor",
      valor: mostrar(veiculo.cor),
    },
    {
      titulo: "Potência",
      valor: mostrar(veiculo.potencia, " cv"),
    },
  ];

  return (
    <div className="detalhes-pagina">
      <div className="detalhes-cabecalho">
        <div>
          <Link
            href="/veiculos"
            className="cadastro-voltar"
          >
            ← Voltar ao estoque
          </Link>

          <h1 className="mt-3">
            {veiculo.marca} {veiculo.modelo}
          </h1>

          <p className="text-muted">
            Ficha completa do veículo
          </p>
        </div>

        <Link
          href={`/veiculos/${veiculo.id}`}
          className="btn detalhes-btn-editar"
        >
          Editar veículo
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="detalhes-card detalhes-galeria">
            <GaleriaVeiculos
              imagens={veiculo.imagens || []}
              nome={`${veiculo.marca} ${veiculo.modelo}`}
            />
          </div>
        </div>

        <div className="col-lg-5">
          <div className="detalhes-card">
            <h5>Resumo do veículo</h5>

            <div className="mt-3">
              <span
                className={`veiculo-status ${
                  veiculo.status === "Disponível"
                    ? "status-disponivel"
                    : veiculo.status === "Reservado"
                    ? "status-reservado"
                    : veiculo.status === "Vendido"
                    ? "status-vendido"
                    : "status-desconhecido"
                }`}
              >
                {veiculo.status || "Não informado"}
              </span>
            </div>

            <hr />

            <small className="text-muted">
              Preço de venda
            </small>

            <h2 className="detalhes-preco">
              {formatarPreco(veiculo.preco)}
            </h2>

            <hr />

            <p>
              <strong>Ano:</strong> {mostrar(veiculo.ano)}
            </p>

            <p>
              <strong>Placa:</strong> {mostrar(veiculo.placa)}
            </p>

            <p>
              <strong>Motor:</strong>{" "}
              {mostrar(veiculo.motorizacao)}
            </p>
          </div>
        </div>

        <div className="col-12">
          <div className="detalhes-card">
            <h5>Ficha técnica</h5>

            <div className="row g-3 mt-2">
              {informacoes.map((info) => (
                <div
                  className="col-6 col-md-4"
                  key={info.titulo}
                >
                  <div className="detalhes-info">
                    <small>{info.titulo}</small>
                    <strong>{info.valor}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="detalhes-card">
            <h5>Descrição e observações</h5>

            <p className="mt-3 mb-0 detalhes-descricao">
              {mostrar(veiculo.descricao)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaginaDetalhes() {
  return (
    <Suspense
      fallback={
        <div className="container-fluid py-4">
          <p>Carregando detalhes do veículo...</p>
        </div>
      }
    >
      <DetalhesVeiculo />
    </Suspense>
  );
}
