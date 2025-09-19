import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Bot, ArrowLeft } from "lucide-react";

const ContextPage = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header com botão voltar */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Link to="/settings">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title="Voltar para Configurações"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Configuração do Bot</h1>
      </div>

      {/* Conteúdo da tela */}
      <div className="flex-1 bg-gray-50">
        <div className="h-full overflow-y-auto">
          <div className="p-6 space-y-8">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Configure o contexto e comportamento do sistema
            </p>
          </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-blue-600 mb-4">
              <Bot className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Assistente Virtual</CardTitle>
            <CardDescription className="text-sm">
              Configure o comportamento do chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-sm text-primary hover:underline">
                Em breve →
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-green-600 mb-4">
              <FileText className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Documentação</CardTitle>
            <CardDescription className="text-sm">
              Base de conhecimento do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-sm text-primary hover:underline">
                Em breve →
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-purple-600 mb-4">
              <Settings className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Configurações</CardTitle>
            <CardDescription className="text-sm">
              Ajustes gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-sm text-primary hover:underline">
                Em breve →
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextPage;