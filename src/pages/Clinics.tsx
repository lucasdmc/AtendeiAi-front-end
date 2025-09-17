import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Clinics = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestão de Clínicas
          </h1>
          <p className="text-lg text-muted-foreground">
            Cadastre e gerencie as clínicas do sistema
          </p>
        </div>
            <Button>
          <Plus className="w-4 h-4 mr-2" />
              Nova Clínica
            </Button>
              </div>
              
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-blue-600 mb-4">
              <Building2 className="w-full h-full" />
              </div>
            <CardTitle className="text-xl">Clínicas Ativas</CardTitle>
            <CardDescription className="text-sm">
              Total de clínicas cadastradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">5</span>
              <p className="text-sm text-muted-foreground">clínicas cadastradas</p>
                </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 text-green-600 mb-4">
              <MapPin className="w-full h-full" />
              </div>
            <CardTitle className="text-xl">Localização</CardTitle>
            <CardDescription className="text-sm">
              Gerencie endereços das clínicas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <span className="text-sm text-primary hover:underline">
                Ver no mapa →
              </span>
              </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clínicas</CardTitle>
          <CardDescription>
            Funcionalidade em desenvolvimento - em breve você poderá gerenciar todas as clínicas aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Interface de gestão de clínicas será implementada em breve
            </p>
                     </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clinics;