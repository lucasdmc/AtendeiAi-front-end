import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClinicProvider } from './contexts/ClinicContext';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import Agenda from './pages/Agenda';
import ContextPage from './pages/ContextPage';
import Conversations from './pages/Conversations';
import Appointments from './pages/Appointments';
import Clinics from './pages/Clinics';
import Users from './pages/Users';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ClinicProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <Layout>
              <Index />
            </Layout>
          } />
          <Route path="/calendar" element={
            <Layout>
              <Agenda />
            </Layout>
          } />
          <Route path="/agenda" element={
            <Layout>
              <Agenda />
            </Layout>
          } />
          <Route path="/context" element={
            <Layout>
              <ContextPage />
            </Layout>
          } />
          <Route path="/conversations" element={
            <Layout>
              <Conversations />
            </Layout>
          } />
          <Route path="/appointments" element={
            <Layout>
              <Appointments />
            </Layout>
          } />
          <Route path="/clinics" element={
            <Layout>
              <Clinics />
            </Layout>
          } />
          <Route path="/users" element={
            <Layout>
              <Users />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ClinicProvider>
  );
}

export default App;