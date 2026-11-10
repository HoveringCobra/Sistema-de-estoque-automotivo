
"use client";

import { useState } from "react";

export default function GaleriaVeiculo({ imagens, nome }) {
  const [fotoAtual, setFotoAtual] = useState(0);

  const fotos = Array.isArray(imagens) ? imagens : [];

  function proximaFoto() {
    setFotoAtual((atual) => (atual + 1) % fotos.length);
  }

  function fotoAnterior() {
    setFotoAtual(
      (atual) => (atual - 1 + fotos.length) % fotos.length
    );
  }

  if (fotos.length === 0) {
    return (
      <div className="carro-imagem">
        <div className="carro-sem-foto">
          🚗 Sem foto
        </div>
      </div>
    );
  }

  return (
    <div className="carro-imagem">
      <img
        src={fotos[fotoAtual]}
        alt={`${nome} - Foto ${fotoAtual + 1}`}
      />

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            className="galeria-seta galeria-anterior"
            onClick={fotoAnterior}
            aria-label="Foto anterior"
          >
            ❮
          </button>

          <button
            type="button"
            className="galeria-seta galeria-proxima"
            onClick={proximaFoto}
            aria-label="Próxima foto"
          >
            ❯
          </button>

          <div className="galeria-contador">
            {fotoAtual + 1} / {fotos.length}
          </div>
        </>
      )}
    </div>
  );
}
