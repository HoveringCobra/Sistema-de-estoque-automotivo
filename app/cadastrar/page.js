
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Cadastrar() {
  const router = useRouter();

  const [veiculo, setVeiculo] = useState({
    marca: "",
    modelo: "",
    ano: "",
    placa: "",
    preco: "",
  });

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setVeiculo({
      ...veiculo,
      [name]: value,
    });
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/veiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(veiculo),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao cadastrar veículo"
        );
      }

      router.push("/veiculos");

    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <h1>Cadastrar Veículo</h1>
      <p>Preencha os dados do novo veículo.</p>

      <div className="card shadow-sm">
        <div className="card-body p-4">

          {erro && (
            <div className="alert alert-danger">
              {erro}
            </div>
          )}

          <form onSubmit={cadastrar}>

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
              className="btn btn-primary"
              type="submit"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Cadastrar Veículo"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
