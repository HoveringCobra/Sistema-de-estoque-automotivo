import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css"

import NavBar from "@/components/NavBar";

export const metadata = {
  title: "AutoManager",
  description: "Sistema de gerenciamento de veiculos",
};

export default function RootLayout({ children }) {
  return (
     <html lang="pt-BR">
      <body>
        <div className="app-layout">
          
        <NavBar />

        <main className="app-content">

          {children}

        </main>
        </div>
      </body>
    </html>
  );
}