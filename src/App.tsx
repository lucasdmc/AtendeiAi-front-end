import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthLoading, ProtectedRoute } from './contexts/AuthContext';
import { InstitutionProvider } from './contexts/InstitutionContext';
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
import Institutions from './pages/Institutions';
import Users from './pages/Users';
import Auth from './pages/Auth';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
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
    <AuthProvider>
      <AuthLoading>
        <InstitutionProvider>
          <Router>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Rotas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/conversations" element={
                <ProtectedRoute>
                  <Layout>
                    <Conversations />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/contacts" element={
                <ProtectedRoute>
                  <Layout>
                    <ContactsNew />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <Layout>
                    <Chatbot />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/ai-agents" element={
                <ProtectedRoute>
                  <Layout>
                    <AIAgents />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <Layout>
                    <AppointmentsNew />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/scheduled-messages" element={
                <ProtectedRoute>
                  <Layout>
                    <ScheduledMessages />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/quick-replies" element={
                <ProtectedRoute>
                  <Layout>
                    <QuickReplies />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Layout>
                    <Tasks />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
          
          {/* Rotas antigas mantidas para compatibilidade */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Layout>
                <Agenda />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/agenda" element={
            <ProtectedRoute>
              <Layout>
                <Agenda />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/context" element={
            <ProtectedRoute>
              <Layout>
                <ContextPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/appointments-old" element={
            <ProtectedRoute>
              <Layout>
                <Appointments />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/institutions" element={
            <ProtectedRoute>
              <Layout>
                <Institutions />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings/conversations" element={
            <ProtectedRoute>
              <Layout>
                <ConversationSettings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings/channels" element={
            <ProtectedRoute>
              <Layout>
                <Channels />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings/channels/new" element={
            <ProtectedRoute>
              <Layout>
                <NewChannel />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings/channels/new/:channelType" element={
            <ProtectedRoute>
              <Layout>
                <ChannelSetup />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings/channels/sync" element={<ChannelSync />} />
        <Route path="/settings/attendants" element={
          <ProtectedRoute>
            <Layout>
              <Attendants />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/departments" element={
          <ProtectedRoute>
            <Layout>
              <Departments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/service-providers" element={
          <ProtectedRoute>
            <Layout>
              <ServiceProviders />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/contacts" element={
          <ProtectedRoute>
            <Layout>
              <Contacts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/financial" element={
          <ProtectedRoute>
            <Layout>
              <Financial />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/tags" element={
          <ProtectedRoute>
            <Layout>
              <Tags />
            </Layout>
          </ProtectedRoute>
        } />
        {/* Editor de fluxo do chatbot */}
        <Route path="/settings/chatbots/editor" element={<ChatbotFlowEditor />} />
        <Route path="/settings/chatbots/editor/:id" element={<ChatbotFlowEditor />} />
        
        <Route path="/settings/chatbots" element={
          <ProtectedRoute>
            <Layout>
              <Chatbot />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/ai-agents" element={
          <ProtectedRoute>
            <Layout>
              <AIAgents />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/quick-replies" element={
          <ProtectedRoute>
            <Layout>
              <QuickReplies />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/scheduled-messages" element={
          <ProtectedRoute>
            <Layout>
              <ScheduledMessages />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/activity-logs" element={
          <ProtectedRoute>
            <Layout>
              <ActivityLogs />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings/institution" element={
          <ProtectedRoute>
            <Layout>
              <Organization />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </InstitutionProvider>
  </AuthLoading>
</AuthProvider>
  );
}

export default App;