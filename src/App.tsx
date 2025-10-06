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
import NewChannel from './pages/NewChannel';
import ChannelSetup from './pages/ChannelSetup';
import ChannelSync from './pages/ChannelSync';
import Attendants from './pages/Attendants';
import Departments from './pages/Departments';
import ServiceProviders from './pages/ServiceProviders';
import Contacts from './pages/Contacts';
import ContactsNew from './pages/ContactsNew';
import Chatbot from './pages/Chatbot';
import ChatbotFlowEditor from './pages/ChatbotFlowEditor';
import AIAgents from './pages/AIAgents';
import Reports from './pages/Reports';
import Financial from './pages/Financial';
import Tags from './pages/Tags';
import ActivityLogs from './pages/ActivityLogs';
import Organization from './pages/Organization';
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
              <Home />
            </Layout>
          } />
          <Route path="/conversations" element={
            <Layout>
              <Conversations />
            </Layout>
          } />
          <Route path="/contacts" element={
            <Layout>
              <ContactsNew />
            </Layout>
          } />
          <Route path="/chatbot" element={
            <Layout>
              <Chatbot />
            </Layout>
          } />
          <Route path="/ai-agents" element={
            <Layout>
              <AIAgents />
            </Layout>
          } />
          <Route path="/reports" element={
            <Layout>
              <Reports />
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
          <Route path="/settings" element={
            <Layout>
              <Settings />
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
          <Route path="/settings/channels/new" element={
            <Layout>
              <NewChannel />
            </Layout>
          } />
          <Route path="/settings/channels/new/:channelType" element={
            <Layout>
              <ChannelSetup />
            </Layout>
          } />
          <Route path="/settings/channels/sync" element={<ChannelSync />} />
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
        <Route path="/settings/financial" element={
          <Layout>
            <Financial />
          </Layout>
        } />
        <Route path="/settings/tags" element={
          <Layout>
            <Tags />
          </Layout>
        } />
        {/* Editor de fluxo do chatbot */}
        <Route path="/settings/chatbots/editor" element={<ChatbotFlowEditor />} />
        <Route path="/settings/chatbots/editor/:id" element={<ChatbotFlowEditor />} />
        
        <Route path="/settings/chatbots" element={
          <Layout>
            <Chatbot />
          </Layout>
        } />
        <Route path="/settings/ai-agents" element={
          <Layout>
            <AIAgents />
          </Layout>
        } />
        <Route path="/settings/quick-replies" element={
          <Layout>
            <QuickReplies />
          </Layout>
        } />
        <Route path="/settings/scheduled-messages" element={
          <Layout>
            <ScheduledMessages />
          </Layout>
        } />
        <Route path="/settings/activity-logs" element={
          <Layout>
            <ActivityLogs />
          </Layout>
        } />
        <Route path="/settings/organization" element={
          <Layout>
            <Organization />
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