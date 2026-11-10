
"use client";

// Lista de detalhes

// toda a parte de detalhes esta aqui pelo menos a visual com javaScript


import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function FormularioEditarVeiculo() {
  const { id } = useParams();
  const router = useRouter();

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
    imagens: [],
    status: "Disponível",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [novasFotos, setNovasFotos] = useState([]);
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const [mensagemFotos, setMensagemFotos] = useState("");
  const [excluindoFoto, setExcluindoFoto] = useState(null);
  const [alterandoCapa, setAlterandoCapa] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);

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

        setVeiculo({
          ...encontrado,
          preco: String(encontrado.preco).replace(",", "."),
          quilometragem: encontrado.quilometragem ?? "",
          motorizacao: encontrado.motorizacao ?? "",
          combustivel: encontrado.combustivel ?? "",
          cambio: encontrado.cambio ?? "",
          cor: encontrado.cor ?? "",
          potencia: encontrado.potencia ?? "",
          descricao: encontrado.descricao ?? "",
          imagens: encontrado.imagens || [],
        });
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

    setVeiculo((anterior) => ({
      ...anterior,
      [name]: value,
    }));
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
        body: JSON.stringify({
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: Number(veiculo.ano),
          placa: veiculo.placa,
          preco: Number(veiculo.preco),

          quilometragem:
            veiculo.quilometragem === ""
              ? null
              : Number(veiculo.quilometragem),

          motorizacao: veiculo.motorizacao,
          combustivel: veiculo.combustivel,
          cambio: veiculo.cambio,
          cor: veiculo.cor,

          potencia:
            veiculo.potencia === ""
              ? null
              : Number(veiculo.potencia),

          descricao: veiculo.descricao,
        }),
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

  function selecionarNovasFotos(evento) {

    const arquivos = Array.from(evento.target.files || []);


    const vagas = 8 - veiculo.imagens.length;

    if (arquivos.length > vagas) {
      setErro(
        `Você pode adicionar no máximo ${vagas} foto(s).`
      );
      evento.target.value = "";
      return;
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    const arquivoInvalido = arquivos.some(
      (foto) =>
        !tiposPermitidos.includes(foto.type) ||
        foto.size === 0 ||
        foto.size > 5 * 1024 * 1024
    );

    if (arquivoInvalido) {
      setErro(
        "Selecione apenas JPG, PNG ou WebP de até 5 MB."
      );
      evento.target.value = "";
      return;
    }

    setErro("");
    setMensagemFotos("");
    setNovasFotos(arquivos);
  }



  async function adicionarFotos() {
    if (novasFotos.length === 0) {
      setErro("Selecione pelo menos uma foto.");
      return;
    }

    setErro("");
    setMensagemFotos("");
    setEnviandoFotos(true);

    try {

      const formulario = new FormData();

      novasFotos.forEach((foto) => {
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


      const resposta = await fetch(
        `/api/veiculos/${id}/imagens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imagens: dadosUpload.imagens,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao associar fotos"
        );
      }

      setVeiculo((anterior) => ({
        ...anterior,
        imagens: [
          ...anterior.imagens,
          ...dadosUpload.imagens,
        ],
      }));

      setNovasFotos([]);
      setMensagemFotos("Fotos adicionadas com sucesso!");

    } catch (erro) {
      setErro(erro.message);
    } finally {
      setEnviandoFotos(false);
    }
  }


  async function excluirFoto(imagem) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta foto?"
    );

    if (!confirmar) return;

    setErro("");
    setMensagemFotos("");
    setExcluindoFoto(imagem);

    try {
      const resposta = await fetch(
        `/api/veiculos/${id}/imagens`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imagem }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao excluir foto"
        );
      }


      setVeiculo((anterior) => ({
        ...anterior,
        imagens: anterior.imagens.filter(
          (foto) => foto !== imagem
        ),
      }));

      setMensagemFotos("Foto excluída com sucesso!");

    } catch (erro) {
      setErro(erro.message);
    } finally {
      setExcluindoFoto(null);
    }
  }


  async function definirCapa(imagem) {
    setErro("");
    setMensagemFotos("");
    setAlterandoCapa(true);

    try {
      const resposta = await fetch(
        `/api/veiculos/${id}/imagens`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imagem }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao alterar a capa"
        );
      }

    
      setVeiculo((anterior) => ({
        ...anterior,
        imagens: dados.imagens,
      }));

      setMensagemFotos("Nova foto de capa definida!");

    } catch (erro) {
      setErro(erro.message);
    } finally {
      setAlterandoCapa(false);
    }
  }


  async function alterarStatus(novoStatus) {
    setErro("");
    setSalvandoStatus(true);

    try {
      const resposta = await fetch(
        `/api/veiculos/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: novoStatus,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao alterar status"
        );
      }

      setVeiculo((anterior) => ({
        ...anterior,
        status: dados.veiculo.status,
      }));

    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvandoStatus(false);
    }
  }


  if (carregando) {
    return <p>Carregando veículo...</p>;
  }

  return (
    <div className="editar-pagina">
      <div className="editar-cabecalho">
        <div>
          <Link href="/veiculos" className="editar-voltar">
            ← Voltar para veículos
          </Link>

          <h1>Editar Veículo</h1>
          <p>
            Atualize os dados e confira as fotos do veículo.
          </p>
        </div>

        <span className="editar-identificador">
          Veículo #{id}
        </span>
      </div>

      {erro && (
        <div className="alert alert-danger">{erro}</div>
      )}

      {veiculo.marca && (
        <form onSubmit={salvar}>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="editar-card">
                <div className="editar-card-titulo">
                  <h5>Informações do veículo</h5>
                  <p>Dados principais do automóvel</p>
                </div>

                <div className="row g-3">

                  <div className="col-12">
                    <label className="form-label">
                      Status do veículo
                    </label>

                    <select
                      className="form-select"
                      value={veiculo.status}
                      onChange={(evento) =>
                        alterarStatus(evento.target.value)
                      }
                      disabled={salvandoStatus}
                    >
                      <option value="Disponível">🟢 Disponível</option>
                      <option value="Reservado">🟡 Reservado</option>
                      <option value="Vendido">⚫ Vendido</option>
                    </select>

                    <small className="text-muted">
                      {salvandoStatus
                        ? "Salvando status..."
                        : "A alteração é salva automaticamente."}
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Marca</label>
                    <input
                      name="marca"
                      className="form-control"
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
                      value={veiculo.preco}
                      onChange={atualizarCampo}
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h5 className="fw-bold">Ficha técnica</h5>
                    <p className="text-muted small">
                      Atualize as características do veículo.
                    </p>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Quilometragem (km)
                    </label>
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
                      rows={4}
                      placeholder="Ex.: Veículo revisado, pneus novos..."
                      value={veiculo.descricao}
                      onChange={atualizarCampo}
                    />
                  </div>

                </div>
              </div>

              <div className="editar-acoes">
                <Link
                  href="/veiculos"
                  className="btn btn-outline-secondary"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  className="btn editar-btn-salvar"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar Alterações"}
                </button>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="editar-card">
                <div className="editar-card-titulo">
                  <h5>Fotos do veículo</h5>
                  <p>
                    {veiculo.imagens.length} de 8 fotos
                    cadastradas
                  </p>
                </div>

                {veiculo.imagens.length > 0 ? (
                  <div className="editar-fotos">
                    {veiculo.imagens.map((imagem, indice) => (
                      <div
                        className="editar-foto"
                        key={imagem}
                      >
                        <img
                          src={imagem}
                          alt={`Foto ${indice + 1}`}
                        />


                        <button
                          type="button"
                          className="editar-excluir-foto"
                          onClick={() => excluirFoto(imagem)}
                          disabled={excluindoFoto !== null || enviandoFotos}
                          title="Excluir foto"
                          aria-label={`Excluir foto ${indice + 1}`}
                        >
                          {excluindoFoto === imagem ? "..." : "🗑️"}
                        </button>


                        {indice !== 0 && (
                          <button
                            type="button"
                            className="editar-definir-capa"
                            onClick={() => definirCapa(imagem)}
                            disabled={
                              alterandoCapa ||
                              excluindoFoto !== null ||
                              enviandoFotos
                            }
                          >
                            {alterandoCapa ? "Aguarde..." : "Definir capa"}
                          </button>
                        )}

                        {indice === 0 && (
                          <span className="editar-capa">
                            Capa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="editar-sem-fotos">
                    <span>📷</span>
                    <p>Nenhuma foto cadastrada</p>
                  </div>
                )}


                <div className="editar-upload">
                  <h6>Adicionar novas fotos</h6>

                  <p className="text-muted">
                    {8 - veiculo.imagens.length} vagas disponíveis
                  </p>

                  <input
                    type="file"
                    className="form-control mb-3"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={selecionarNovasFotos}
                    disabled={veiculo.imagens.length >= 8 || enviandoFotos}
                  />

                  {novasFotos.length > 0 && (
                    <p className="text-muted">
                      {novasFotos.length} nova(s) foto(s) selecionada(s)
                    </p>
                  )}

                  {mensagemFotos && (
                    <div className="alert alert-success">
                      {mensagemFotos}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn editar-btn-salvar w-100"
                    onClick={adicionarFotos}
                    disabled={
                      novasFotos.length === 0 ||
                      enviandoFotos ||
                      veiculo.imagens.length >= 8
                    }
                  >
                    {enviandoFotos
                      ? "Enviando fotos..."
                      : "Adicionar Fotos"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function EditarVeiculo() {
  return (
    <Suspense fallback={<p>Carregando edição...</p>}>
      <FormularioEditarVeiculo />
    </Suspense>
  );
}
