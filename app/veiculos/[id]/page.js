
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditarVeiculo() {
  const { id } = useParams();
  const router = useRouter();

  const [veiculo, setVeiculo] = useState({
    marca: "",
    modelo: "",
    ano: "",
    placa: "",
    preco: "",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscarVeiculo() {
      try {
        const resposta = await fetch("/api/veiculos");

        if (!resposta.ok) {
          throw new Error("Erro ao buscar veículos");
        }

        const dados = await resposta.json();

        const encontrado = dados.find(
          (item) => String(item.id) === String(id)
        );

        if (!encontrado) {
          throw new Error("Veículo não encontrado");
        }

        setVeiculo(encontrado);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    buscarVeiculo();
  }, [id]);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setVeiculo({
      ...veiculo,
      [name]: value,
    });
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch(`/api/veiculos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(veiculo),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao atualizar veículo"
        );
      }

      router.push("/veiculos");

    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p>Carregando veículo...</p>;
  }

  return (
    <div>
      <h1>Editar Veículo</h1>
      <p>Atualize as informações do veículo.</p>

      {erro && (
        <div className="alert alert-danger">
          {erro}
        </div>
      )}

      {!erro && (
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={salvar}>
              {["marca", "modelo", "ano", "placa", "preco"].map(
                (campo) => (
                  <div className="mb-3" key={campo}>
                    <label className="form-label text-capitalize">
                      {campo}
                    </label>

                    <input
                      className="form-control"
                      name={campo}
                      type={
                        ["ano", "preco"].includes(campo)
                          ? "number"
                          : "text"
                      }
                      step={campo === "preco" ? "0.01" : undefined}
                      value={veiculo[campo]}
                      onChange={atualizarCampo}
                      required
                    />
                  </div>
                )
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
