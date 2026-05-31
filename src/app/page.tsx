export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Academia Haas</h1>
        <p className="text-slate-300">Bem-vindo ao nosso portal de ensino</p>
        <div className="mt-8 space-x-4">
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Fazer Login
          </a>
        </div>
      </div>
    </div>
  );
}
