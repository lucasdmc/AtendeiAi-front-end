import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClinicProvider } from './contexts/ClinicContext';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import ContextPage from './pages/ContextPage';
import Conversations from './pages/Conversations';
import Appointments from './pages/Appointments';
import Clinics from './pages/Clinics';
import Users from './pages/Users';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import Channels from './pages/Channels';
import Attendants from './pages/Attendants';
import Departments from './pages/Departments';
import ServiceProviders from './pages/ServiceProviders';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
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
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
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
          <Route path="/conversations" element={<Conversations />} />
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
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          <Route path="/settings/channels" element={
            <Layout>
              <Channels />
            </Layout>
          } />
        <Route path="/settings/attendants" element={
          <Layout>
            <Attendants />
          </Layout>
        } />
        <Route path="/settings/departments" element={
          <Layout>
            <Departments />
          </Layout>
        } />
        <Route path="/settings/service-providers" element={
          <Layout>
            <ServiceProviders />
          </Layout>
        } />
        <Route path="/settings/contacts" element={
          <Layout>
            <Contacts />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ClinicProvider>
  );
}

export default App;