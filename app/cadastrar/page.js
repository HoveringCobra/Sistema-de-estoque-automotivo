
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Cadastrar() {
  const inputFotosRef = useRef(null);

  const [veiculo, setVeiculo] = useState({
    marca: "",
    modelo: "",
    ano: "",
    placa: "",
    preco: "",
    quilometragem: "",
    motorizacao: "",
    combustivel: "",
    cambio: "",
    cor: "",
    potencia: "",
    descricao: "",
  });

  const [fotos, setFotos] = useState([]);
  const [previas, setPrevias] = useState([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");



  useEffect(() => {
    const urls = fotos.map((foto) =>
      URL.createObjectURL(foto)
    );

    setPrevias(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fotos]);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setVeiculo((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function selecionarFotos(evento) {
    const arquivos = Array.from(evento.target.files || []);

    if (arquivos.length > 8) {
      setErro("Você pode selecionar no máximo 8 fotos.");
      evento.target.value = "";
      return;
    }

    const formatos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidas = arquivos.some(
      (foto) =>
        !formatos.includes(foto.type) ||
        foto.size === 0 ||
        foto.size > 5 * 1024 * 1024
    );

    if (invalidas) {
      setErro(
        "Use fotos JPG, PNG ou WebP de até 5 MB cada."
      );
      evento.target.value = "";
      return;
    }

    setErro("");
    setFotos(arquivos);
  }


  function removerFoto(indice) {
    setFotos((anteriores) =>
      anteriores.filter((_, i) => i !== indice)
    );
  }


  function limparFormulario() {
    setVeiculo({
      marca: "",
      modelo: "",
      ano: "",
      placa: "",
      preco: "",
      quilometragem: "",
      motorizacao: "",
      combustivel: "",
      cambio: "",
      cor: "",
      potencia: "",
      descricao: "",
    });

    setFotos([]);
    setPrevias([]);
    setErro("");
    setSucesso("");

    if (inputFotosRef.current) {
      inputFotosRef.current.value = "";

    }

  }

// funcao cadastro
  async function cadastrar(evento) {

    evento.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      let imagens = [];


      if (fotos.length > 0) {
        const formulario = new FormData();

        fotos.forEach((foto) => {
          formulario.append("imagens", foto);
        });

        const respostaUpload = await fetch("/api/upload", {
          method: "POST",
          body: formulario,
        });

        const dadosUpload = await respostaUpload.json();

        if (!respostaUpload.ok) {
          throw new Error(
            dadosUpload.erro || "Erro ao enviar fotos"
          );
        }

        imagens = dadosUpload.imagens;
      }

      // Cadastrar veículo no PGadmin
      const resposta = await fetch("/api/veiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...veiculo,
          ano: Number(veiculo.ano),
          preco: Number(veiculo.preco),
          placa: veiculo.placa.trim().toUpperCase(),
          imagens,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao cadastrar veículo"
        );
      }

      limparFormulario();
      setSucesso("Veículo cadastrado com sucesso!");

    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // Parte visual da tela de cadastro
  return (
    <div className="cadastro-pagina">

      
      <div className="cadastro-cabecalho">
        <div>
          <Link href="/veiculos" className="cadastro-voltar">
            ← Voltar para veículos
          </Link>

          <h1>Cadastrar Veículo</h1>
          <p>
            Adicione um novo automóvel ao estoque do AutoManager.
          </p>
        </div>

        <button
          type="button"
          className="cadastro-identificador"
          onClick={limparFormulario}
          disabled={salvando}
        >
          + Novo veículo
        </button>
      </div>

      {erro && (
        <div className="alert alert-danger">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="alert alert-success">
          {sucesso}
        </div>
      )}

      <form onSubmit={cadastrar}>
        <div className="row g-4">

          
          <div className="col-lg-8">
            <div className="cadastro-card">

              <div className="cadastro-card-titulo">
                <h5>Informações do veículo</h5>
                <p>Preencha os dados principais do automóvel.</p>
              </div>

              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label">Marca</label>
                  <input
                    name="marca"
                    className="form-control"
                    placeholder="Ex.: Volkswagen"
                    value={veiculo.marca}
                    onChange={atualizarCampo}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Modelo</label>
                  <input
                    name="modelo"
                    className="form-control"
                    placeholder="Ex.: Amarok"
                    value={veiculo.modelo}
                    onChange={atualizarCampo}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Ano</label>
                  <input
                    name="ano"
                    type="number"
                    min="1900"
                    max="2100"
                    className="form-control"
                    placeholder="Ex.: 2020"
                    value={veiculo.ano}
                    onChange={atualizarCampo}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Placa</label>
                  <input
                    name="placa"
                    className="form-control"
                    placeholder="Ex.: ABC1D23"
                    maxLength={7}
                    value={veiculo.placa}
                    onChange={atualizarCampo}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Preço de venda (R$)
                  </label>
                  <input
                    name="preco"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder="Ex.: 95000.00"
                    value={veiculo.preco}
                    onChange={atualizarCampo}
                    required
                  />
                </div>

                <div className="col-12 mt-4">
                  <h5 className="fw-bold">Ficha técnica</h5>
                  <p className="text-muted small">
                    Informações adicionais do veículo.
                  </p>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Quilometragem (km)</label>
                  <input
                    type="number"
                    min="0"
                    name="quilometragem"
                    className="form-control"
                    placeholder="Ex.: 145000"
                    value={veiculo.quilometragem}
                    onChange={atualizarCampo}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Motorização</label>
                  <input
                    type="text"
                    name="motorizacao"
                    className="form-control"
                    placeholder="Ex.: 2.0 TDI"
                    value={veiculo.motorizacao}
                    onChange={atualizarCampo}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Combustível</label>
                  <select
                    name="combustivel"
                    className="form-select"
                    value={veiculo.combustivel}
                    onChange={atualizarCampo}
                  >
                    <option value="">Selecione</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Flex">Flex</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Câmbio</label>
                  <select
                    name="cambio"
                    className="form-select"
                    value={veiculo.cambio}
                    onChange={atualizarCampo}
                  >
                    <option value="">Selecione</option>
                    <option value="Manual">Manual</option>
                    <option value="Automático">Automático</option>
                    <option value="Automatizado">Automatizado</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Cor</label>
                  <input
                    type="text"
                    name="cor"
                    className="form-control"
                    placeholder="Ex.: Prata"
                    value={veiculo.cor}
                    onChange={atualizarCampo}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Potência (cv)</label>
                  <input
                    type="number"
                    min="0"
                    name="potencia"
                    className="form-control"
                    placeholder="Ex.: 180"
                    value={veiculo.potencia}
                    onChange={atualizarCampo}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Descrição e observações
                  </label>
                  <textarea
                    name="descricao"
                    className="form-control"
                    rows="4"
                    placeholder="Ex.: Veículo revisado, pneus novos..."
                    value={veiculo.descricao}
                    onChange={atualizarCampo}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Status inicial
                  </label>

                  <div className="cadastro-status">
                    <span className="cadastro-status-ponto" />
                    Disponível
                  </div>

                  <small className="text-muted">
                    O veículo será cadastrado como disponível.
                    Você poderá alterar o status na edição.
                  </small>
                </div>

              </div>
            </div>

            {/* BOTÕES */}
            <div className="cadastro-acoes">
              <Link
                href="/veiculos"
                className="btn btn-outline-secondary"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="btn cadastro-btn-salvar"
                disabled={salvando}
              >
                {salvando
                  ? "Cadastrando..."
                  : "+ Cadastrar Veículo"}
              </button>
            </div>
          </div>

          
          <div className="col-lg-4">
            <div className="cadastro-card">

              <div className="cadastro-card-titulo">
                <h5>Fotos do veículo</h5>
                <p>
                  {fotos.length} de 8 fotos selecionadas
                </p>
              </div>

              <label className="cadastro-upload-area">
                <span className="cadastro-upload-icone">
                  📷
                </span>

                <strong>Selecionar fotos</strong>

                <small>
                  JPG, PNG ou WebP
                </small>

                <small>
                  Até 8 imagens de 5 MB cada
                </small>

                <input
                  ref={inputFotosRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={selecionarFotos}
                  disabled={salvando}
                />
              </label>

           
              {previas.length > 0 ? (
                <div className="cadastro-fotos">
                  {previas.map((url, indice) => (
                    <div
                      className="cadastro-foto"
                      key={url}
                    >
                      <img
                        src={url}
                        alt={`Prévia ${indice + 1}`}
                      />

                      <button
                        type="button"
                        className="cadastro-remover-foto"
                        onClick={() => removerFoto(indice)}
                        disabled={salvando}
                        title="Remover foto"
                      >
                        ×
                      </button>

                      {indice === 0 && (
                        <span className="cadastro-capa">
                          Capa
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cadastro-sem-fotos">
                  Nenhuma foto selecionada
                </div>
              )}

              <div className="cadastro-fotos-contador">
                {fotos.length}/8 fotos
              </div>

              <small className="text-muted">
                A primeira foto será a capa do veículo.
              </small>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
