import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClinicProvider } from './contexts/ClinicContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import ContextPage from './pages/ContextPage';
import Conversations from './pages/Conversations';
import Appointments from './pages/Appointments';
import AppointmentsNew from './pages/AppointmentsNew';
import ScheduledMessages from './pages/ScheduledMessages';
import QuickReplies from './pages/QuickReplies';
import Tasks from './pages/Tasks';
import Clinics from './pages/Clinics';
import Users from './pages/Users';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import ConversationSettings from './pages/ConversationSettings';
import Channels from './pages/Channels';
import Attendants from './pages/Attendants';
import Departments from './pages/Departments';
import ServiceProviders from './pages/ServiceProviders';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Chats from './pages/Chats';

function App() {
  return (
    <ClinicProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/conversations" element={
            <Layout>
              <Conversations />
            </Layout>
          } />
          <Route path="/chats" element={
            <Layout>
              <Chats />
            </Layout>
          } />
          <Route path="/appointments" element={
            <Layout>
              <AppointmentsNew />
            </Layout>
          } />
          <Route path="/scheduled-messages" element={
            <Layout>
              <ScheduledMessages />
            </Layout>
          } />
          <Route path="/quick-replies" element={
            <Layout>
              <QuickReplies />
            </Layout>
          } />
          <Route path="/tasks" element={
            <Layout>
              <Tasks />
            </Layout>
          } />
          
          {/* Rotas antigas mantidas para compatibilidade */}
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
          <Route path="/appointments-old" element={
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
          <Route path="/settings/conversations" element={
            <Layout>
              <ConversationSettings />
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