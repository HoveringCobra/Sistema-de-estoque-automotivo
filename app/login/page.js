import Link from "next/link";
import "./login.css";

export default function login(){
    return(
        <main className="inicio-pagina">
            <div className="inicio-conteudo">
                <Link href="/" className="inicio-botao">
                INICIAR
                </Link>
            </div>
        </main>
    );
}