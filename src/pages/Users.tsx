import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Users = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestão de Usuários
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie usuários e suas permissões no sistema
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-blue-600 mb-4">
              <UsersIcon className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Usuários Ativos</CardTitle>
            <CardDescription className="text-sm">
              Visualize todos os usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">12</span>
              <p className="text-sm text-muted-foreground">usuários cadastrados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-green-600 mb-4">
              <Shield className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Administradores</CardTitle>
            <CardDescription className="text-sm">
              Usuários com permissões administrativas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">3</span>
              <p className="text-sm text-muted-foreground">administradores</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-purple-600 mb-4">
              <UsersIcon className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Atendentes</CardTitle>
            <CardDescription className="text-sm">
              Usuários responsáveis pelo atendimento
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">9</span>
              <p className="text-sm text-muted-foreground">atendentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Funcionalidade em desenvolvimento - em breve você poderá gerenciar todos os usuários aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Interface de gestão de usuários será implementada em breve
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;