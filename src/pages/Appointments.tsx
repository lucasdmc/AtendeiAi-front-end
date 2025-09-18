import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Appointments = () => {
  return (
    <div className="h-full bg-gray-50">
      <div className="h-full overflow-y-auto">
        <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Agendamentos
          </h1>
          <p className="text-lg text-muted-foreground">
            Visualize e acompanhe os agendamentos das clínicas
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-blue-600 mb-4">
              <Calendar className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Hoje</CardTitle>
            <CardDescription className="text-sm">
              Agendamentos para hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">8</span>
              <p className="text-sm text-muted-foreground">consultas agendadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-green-600 mb-4">
              <Clock className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Esta Semana</CardTitle>
            <CardDescription className="text-sm">
              Agendamentos da semana
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">45</span>
              <p className="text-sm text-muted-foreground">consultas programadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-purple-600 mb-4">
              <Users className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Pacientes</CardTitle>
            <CardDescription className="text-sm">
              Total de pacientes únicos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">156</span>
              <p className="text-sm text-muted-foreground">pacientes ativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendário de Agendamentos</CardTitle>
          <CardDescription>
            Funcionalidade em desenvolvimento - em breve você poderá visualizar o calendário completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Interface de calendário será implementada em breve
            </p>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;