import Link from "next/link";

export default function NavBar() {
    return (
        <aside className="navbar">
            <p>
                <img src="/IMG/logo-automanager-transparente.png" className="img-fluid" alt="logo lateral"></img>
            </p>

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