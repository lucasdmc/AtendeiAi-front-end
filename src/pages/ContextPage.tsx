import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Settings, Bot } from "lucide-react";

const ContextPage = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Página de Contexto
        </h1>
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
  );
};

export default ContextPage;