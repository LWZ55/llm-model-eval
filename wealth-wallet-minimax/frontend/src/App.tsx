import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AccountDetail from './pages/AccountDetail';
import NewAccount from './pages/NewAccount';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">💰</span>
            <span>Wealth Wallet</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition ${
                location.pathname === '/' ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/accounts/new"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              + New Account
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts/new" element={<NewAccount />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
        </Routes>
      </main>
    </div>
  );
}

function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWithRouter;