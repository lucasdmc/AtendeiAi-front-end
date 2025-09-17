import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Settings, Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Context = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
                <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Contexto do Chatbot
          </h1>
          <p className="text-lg text-muted-foreground">
            Configure as informações e comportamento do assistente virtual
          </p>
                </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contexto
        </Button>
                </div>
                
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-blue-600 mb-4">
              <Bot className="w-full h-full" />
                        </div>
            <CardTitle className="text-xl">Personalidade</CardTitle>
            <CardDescription className="text-sm">
              Configure como o bot se comporta
            </CardDescription>
              </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-sm text-primary hover:underline">
                Configurar →
              </span>
                </div>
              </CardContent>
            </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-green-600 mb-4">
              <FileText className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Base de Conhecimento</CardTitle>
            <CardDescription className="text-sm">
              Informações que o bot pode usar
            </CardDescription>
              </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-sm text-primary hover:underline">
                Gerenciar →
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
              Ajustes avançados do sistema
            </CardDescription>
              </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-sm text-primary hover:underline">
                Acessar →
                              </span>
                            </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
          <CardTitle>Editor de Contexto</CardTitle>
          <CardDescription>
            Funcionalidade em desenvolvimento - em breve você poderá editar o contexto do chatbot
          </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Editor de contexto será implementado em breve
            </p>
                </div>
              </CardContent>
            </Card>
    </div>
  );
};

export default Context;