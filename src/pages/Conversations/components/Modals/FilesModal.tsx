import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Upload,
  Calendar,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { useConversationsContext } from '../../context';
import { PatientFile } from '../../types';

export const FilesModal: React.FC = () => {
  const { 
    filesModalOpen, 
    setFilesModalOpen, 
    patientInfo 
  } = useConversationsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'document'>('all');

  // Filtrar arquivos
  const filteredFiles = patientInfo.files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || file.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Contadores por tipo
  const fileCounts = {
    all: patientInfo.files.length,
    image: patientInfo.files.filter(f => f.type === 'image').length,
    document: patientInfo.files.filter(f => f.type === 'document').length
  };

  const handleDownload = (file: PatientFile) => {
    console.log('Baixando arquivo:', file.name);
    // Implementar download real
  };

  const handleView = (file: PatientFile) => {
    console.log('Visualizando arquivo:', file.name);
    // Implementar visualização
  };

  const handleUpload = () => {
    console.log('Abrindo seletor de arquivos...');
    // Implementar upload
  };

  return (
    <Dialog open={filesModalOpen} onOpenChange={setFilesModalOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Arquivos do Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de ferramentas */}
          <div className="flex items-center justify-between gap-4">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Upload */}
            <Button onClick={handleUpload} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Enviar Arquivo
            </Button>
          </div>

          {/* Filtros por tipo */}
          <div className="flex gap-2">
            <Badge
              variant={selectedType === 'all' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedType('all')}
            >
              <File className="h-3 w-3 mr-1" />
              Todos ({fileCounts.all})
            </Badge>
            
            <Badge
              variant={selectedType === 'image' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedType('image')}
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              Imagens ({fileCounts.image})
            </Badge>
            
            <Badge
              variant={selectedType === 'document' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedType('document')}
            >
              <FileText className="h-3 w-3 mr-1" />
              Documentos ({fileCounts.document})
            </Badge>
          </div>

          {/* Lista de arquivos */}
          <ScrollArea className="h-96">
            {filteredFiles.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                {searchTerm ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo disponível'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Preview do arquivo */}
                    <div className="mb-3">
                      {file.type === 'image' ? (
                        <div className="w-full h-32 rounded overflow-hidden bg-gray-100">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded bg-blue-50 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Informações do arquivo */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {file.date}
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {file.type === 'image' ? 'Imagem' : 'Documento'}
                      </Badge>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(file)}
                        className="flex-1 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="flex-1 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer com estatísticas */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
            <span>
              {filteredFiles.length} de {patientInfo.files.length} arquivos
            </span>
            <span>
              Total: {fileCounts.image} imagens, {fileCounts.document} documentos
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
