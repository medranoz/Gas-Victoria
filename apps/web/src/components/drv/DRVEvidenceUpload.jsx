import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { UploadCloud, Trash2, FileImage } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const DRVEvidenceUpload = ({ registroId, evidences, loading, onUpload, onDelete }) => {
  const [file, setFile] = useState(null);
  const [comments, setComentarios] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const res = await onUpload(registroId, file, comments);
    if (res.success) {
      setFile(null);
      setComentarios('');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-xl">Subir Nueva Evidencia</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              {file ? (
                <div className="text-sm font-medium text-primary">{file.name}</div>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">Arrastra tu imagen aquí o haz clic para buscar</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP (Max. 10MB)</p>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} className="hidden" id="evidence-upload" />
              <Label htmlFor="evidence-upload" className="mt-4 inline-block cursor-pointer px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
                Seleccionar Archivo
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Comentarios (Opcional)</Label>
              <Textarea value={comments} onChange={(e) => setComentarios(e.target.value)} rows={2} placeholder="Descripción de la evidencia..." />
            </div>

            <Button type="submit" disabled={!file || loading} className="w-full">
              {loading ? 'Subiendo...' : 'Subir Evidencia'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Evidencias Subidas ({evidences?.length || 0})</h3>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : evidences?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidences.map((evi) => (
              <div key={evi.id} className="relative group rounded-xl overflow-hidden border shadow-sm bg-card flex flex-col">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={pb.files.getURL(evi, evi.archivo)} 
                    alt={`Evidencia ${evi.evidencia_id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href={pb.files.getURL(evi, evi.archivo)} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                      <FileImage className="w-5 h-5" />
                    </a>
                    <button onClick={() => onDelete(evi.id)} className="p-2 bg-destructive/80 hover:bg-destructive rounded-full text-white backdrop-blur-sm transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-3 text-sm flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{evi.evidencia_id}</span>
                    <span className="text-xs text-muted-foreground">{new Date(evi.fecha_carga).toLocaleDateString()}</span>
                  </div>
                  <p className="text-foreground line-clamp-2 flex-1 text-sm">{evi.comentarios || 'Sin comentarios'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border rounded-xl bg-muted/20">
            No hay evidencias para este registro.
          </div>
        )}
      </div>
    </div>
  );
};

export default DRVEvidenceUpload;