import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import Diagnostic from './pages/Diagnostic';
import Remedy from './pages/Remedy';
import Status from './pages/Status';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

export default function App() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/remedy" element={<Remedy />} />
          <Route path="/status" element={<Status />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}
