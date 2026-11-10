import Link from "next/link";
import DashboardEstatisticas from "@/components/DashboardEstatisticas";

export default function Home() {
  return (
    <div>
      <div className="dashboard-boas-vindas">
        <div className="banner-conteudo">
          <h1>Olá, Administrador!</h1>

          <p>
            Bem-vindo ao AutoManager. Aqui você pode
            gerenciar os veículos da sua revenda
            de forma simples e prática.
          </p>

          <div className="banner-linha"></div>
        </div>

        <div className="banner-imagem">
          <div className="banner-faixa"></div>
        </div>
      </div>

      <DashboardEstatisticas />

      <div className="row g-4 mt-4">
        <div className="col-md-6 col-xl-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h2>🚗</h2>
              <h5>Cadastrar Veículo</h5>
              <p>Adicione um novo veículo ao sistema.</p>
              <Link href="/cadastrar" className="btn btn-primary">
                Acessar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h2>📋</h2>
              <h5>Listar Veículos</h5>
              <p>Consulte os veículos cadastrados.</p>
              <Link href="/veiculos" className="btn btn-primary">
                Acessar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h2>✏️</h2>
              <h5>Editar Veículos</h5>
              <p>Atualize os dados dos veículos.</p>
              <Link href="/veiculos" className="btn btn-primary">
                Acessar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card dashboard-card">
            <div className="card-body">
              <h2>🗑️</h2>
              <h5>Excluir Veículos</h5>
              <p>Remova veículos cadastrados.</p>
              <Link href="/veiculos" className="btn btn-primary">
                Acessar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}