import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";

const Agenda = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Agenda
        </h1>
        <p className="text-lg text-muted-foreground">
          Visualize e gerencie seus agendamentos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-blue-600 mb-4">
              <Calendar className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Visualização Mensal</CardTitle>
            <CardDescription className="text-sm">
              Veja todos os agendamentos do mês
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
              <Clock className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Agendamentos de Hoje</CardTitle>
            <CardDescription className="text-sm">
              Consultas e compromissos do dia
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
              <Users className="w-full h-full" />
            </div>
            <CardTitle className="text-xl">Pacientes</CardTitle>
            <CardDescription className="text-sm">
              Gerencie informações dos pacientes
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

export default Agenda;