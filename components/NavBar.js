import Link from "next/link";

export default function NavBar() {
  return (
    <aside className="navbar">

      <div className="navbar-logo">
        <h2>AutoManager</h2>
        <p>Gestão de Veículos</p>
      </div>

      <nav className="navbar-menu">

        <Link href="/" className="navbar-link">
          🏠 Início
        </Link>

        <Link href="/veiculos" className="navbar-link">
          🚗 Veículos
        </Link>

        <Link href="/cadastrar" className="navbar-link">
          ➕ Cadastrar Veículo
        </Link>

      </nav>

      <div className="navbar-footer">
        <p>AutoManager © 2026</p>
      </div>

    </aside>
  );
}