import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Users, Mail, Save, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import { useClinicSettings, useUpdateConversationSettings } from '../hooks/useClinicSettings';

export default function ConversationSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ID da clínica (hardcoded por enquanto)
  const clinicId = '68cd84230e29f31cf5f5f1b8';
  
  // Hooks para gerenciar configurações
  const { data: settings, isLoading, error } = useClinicSettings(clinicId);
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateConversationSettings();
  
  // Estados locais para os toggles
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
  
  // Atualizar estados locais quando as configurações carregarem
  React.useEffect(() => {
    if (settings?.conversations) {
      setShowNewsletter(settings.conversations.show_newsletter);
      setShowGroups(settings.conversations.show_groups);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      clinicId,
      settings: {
        show_newsletter: showNewsletter,
        show_groups: showGroups
      }
    }, {
      onSuccess: () => {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de conversas foram atualizadas com sucesso.',
          variant: 'default'
        });
      },
      onError: (error) => {
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar as configurações. Tente novamente.',
          variant: 'destructive'
        });
        console.error('Erro ao salvar configurações:', error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar configurações</p>
          <Button onClick={() => navigate('/settings')}>
            Voltar para Configurações
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 flex">
      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Configurações de Conversas</h1>
                <p className="text-sm text-gray-500">Gerencie como as conversas são exibidas na interface</p>
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Card de Filtros de Visualização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Filtros de Visualização</span>
                </CardTitle>
                <CardDescription>
                  Configure quais tipos de conversas devem aparecer na lista de conversas. 
                  As conversas continuarão sendo processadas normalmente, apenas não serão exibidas na interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Toggle Newsletter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <div>
                      <Label htmlFor="newsletter-toggle" className="text-base font-medium">
                        Conversas de Newsletter
                      </Label>
                      <p className="text-sm text-gray-500">
                        Exibir conversas identificadas como newsletter (@newsletter)
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="newsletter-toggle"
                    checked={showNewsletter}
                    onCheckedChange={setShowNewsletter}
                  />
                </div>

                <Separator />

                {/* Toggle Grupos */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label htmlFor="groups-toggle" className="text-base font-medium">
                        Conversas de Grupo
                      </Label>
                      <p className="text-sm text-gray-500">
                        Exibir conversas de grupos do WhatsApp (@group)
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="groups-toggle"
                    checked={showGroups}
                    onCheckedChange={setShowGroups}
                  />
                </div>

              </CardContent>
            </Card>

            {/* Card de Informações */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Como funciona?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• As mensagens continuam sendo processadas normalmente</li>
                      <li>• Apenas a visualização na interface é afetada</li>
                      <li>• Os filtros da lista de conversas são ajustados automaticamente</li>
                      <li>• As configurações são salvas automaticamente na nuvem</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
