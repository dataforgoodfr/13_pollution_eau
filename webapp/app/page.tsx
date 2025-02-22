import 'bootstrap/dist/css/bootstrap.css'
import MainMap from "@/components/Map";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-blue-700 text-white">
        <h1 className="text-2xl font-bold">
          Pollution de l&apos;Eau Potable en France
        </h1>
      </header>

      <main className="flex-1">
       <MainMap />          
      </main>

      <footer className="p-4 bg-gray-100 text-center text-sm">
        <p>Données ouvertes sur la qualité de l&apos;eau en France</p>
      </footer>
    </div>
  );
}

