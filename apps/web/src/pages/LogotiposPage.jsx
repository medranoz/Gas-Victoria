import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Upload, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LogotiposPreview from '@/components/configuracion/LogotiposPreview.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useLogotipos } from '@/hooks/useLogotipos.js';

const LOGO_TYPES = [
  { id: 'header', title: 'Logo Principal (Header)', desc: 'Visible en la barra de navegación superior. Altura recomendada: 40px.', aspect: 'horizontal' },
  { id: 'login', title: 'Logo Pantalla Login', desc: 'Visible centrado en el formulario de inicio de sesión. Tamaño recomendado: 250x100px.', aspect: 'horizontal' },
  { id: 'dashboard', title: 'Marca de Agua (Dashboard)', desc: 'Fondo sutil en el dashboard principal. Se recomienda imagen con transparencia.', aspect: 'square' },
  { id: 'favicon', title: 'Favicon (Navegador)', desc: 'Ícono de la pestaña. Tamaño: 32x32px (cuadrado).', aspect: 'square' }
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

const LogoUploadCard = ({ typeInfo, onUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (file) => {
    console.log(`[LogotiposPage] Validating selected file:`, file?.name);
    setLocalError('');
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
      const errorMsg = `Formato no válido (${file.type}). Usa PNG, JPG, JPEG o SVG.`;
      console.warn(`[LogotiposPage] Validation failed: ${errorMsg}`);
      setLocalError(errorMsg);
      setSelectedFile(null);
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `El archivo excede el límite de 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB).`;
      console.warn(`[LogotiposPage] Validation failed: ${errorMsg}`);
      setLocalError(errorMsg);
      setSelectedFile(null);
      return;
    }

    console.log(`[LogotiposPage] File passed initial validation. Ready for upload.`);
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    const success = await onUpload(typeInfo.id, selectedFile);
    if (success) {
      setSelectedFile(null);
    }
  };

  return (
    <Card className="shadow-sm border-border/60 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3 border-b bg-muted/5">
        <CardTitle className="text-base font-bold text-foreground">{typeInfo.title}</CardTitle>
        <CardDescription className="text-xs">{typeInfo.desc}</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          
          <div className="flex-1 w-full space-y-3">
            <div 
              className={`upload-area ${isDragging ? 'upload-area-drag' : ''} ${localError ? 'upload-area-error' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              
              <div className="flex flex-col items-center justify-center py-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${localError ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                  <Upload className={`h-5 w-5 ${localError ? 'text-destructive' : 'text-primary'}`} />
                </div>
                {selectedFile ? (
                  <p className="text-sm font-semibold text-primary truncate max-w-[200px]">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground mb-1">Arrastra tu logo aquí o haz clic</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG hasta 5MB</p>
                  </>
                )}
              </div>
            </div>
            
            {localError && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{localError}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-40 shrink-0 flex flex-col items-center justify-center sm:pt-2">
            <Button 
              className="w-full shadow-sm"
              disabled={!selectedFile || isUploading}
              onClick={handleUploadClick}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Actualizar Logo
                </>
              )}
            </Button>
            {selectedFile && !isUploading && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-muted-foreground hover:text-destructive text-xs h-8"
                onClick={() => { setSelectedFile(null); setLocalError(''); }}
              >
                Cancelar selección
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LogotiposPage = () => {
  const navigate = useNavigate();
  const { 
    logotipos, 
    isLoading: isFetching, 
    uploadLogo, 
    fetchLogotipos
  } = useLogotipos();

  const [uploadingType, setUploadingType] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    console.log(`[LogotiposPage] Component mounted. Initiating initial fetch...`);
    fetchLogotipos();
  }, [fetchLogotipos]);

  // Comprehensive Upload Handler
  const handleUpload = async (tipo, file) => {
    console.log(`[LogotiposPage] Upload initiated for section: ${tipo}`);
    setUploadingType(tipo);
    
    // 3. Wrap upload in try-catch with detailed error messages
    try {
      // 1. Validate file type and size before upload (double check)
      if (!file) {
        throw new Error('No se ha seleccionado ningún archivo para subir.');
      }
      
      if (!VALID_TYPES.includes(file.type)) {
        throw new Error(`Formato de archivo inválido: ${file.type}. Se requiere PNG, JPG o SVG.`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). El máximo es 5MB.`);
      }

      // 4. Call useLogotipos.uploadLogo(tipo, file)
      console.log(`[LogotiposPage] Calling uploadLogo API...`);
      const result = await uploadLogo(tipo, file);
      
      if (!result.success) {
         // Throwing to catch block to centralize error handling
         throw result.error || new Error('Ocurrió un error desconocido al subir el archivo.');
      }

      console.log(`[LogotiposPage] Upload successful! Returned result:`, result);

      // 5. After successful upload, immediately call fetchLogotipos() to refresh data
      console.log(`[LogotiposPage] Triggering fetchLogotipos to refresh UI with new cache-busted URLs...`);
      await fetchLogotipos();
      
      // 7. Show success toast with file name
      toast.success(`Logotipo guardado exitosamente: ${file.name}`);
      
      return true;
    } catch (error) {
      // 9. Handle network errors gracefully
      console.error(`[LogotiposPage] Exception caught during upload:`, error);
      
      let errorMessage = 'Ocurrió un error al subir el logotipo.';
      if (error.response?.data?.message) {
        errorMessage = `Error del servidor: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // 2. Show validation/upload errors to user
      toast.error(errorMessage);
      return false;
    } finally {
      setUploadingType(null);
    }
  };

  const handleManualRefresh = async () => {
    console.log(`[LogotiposPage] Manual refresh triggered by user.`);
    setIsRefreshing(true);
    await fetchLogotipos();
    setIsRefreshing(false);
    toast.success('Previsualización actualizada');
  };

  return (
    <>
      <Helmet>
        <title>Gestión de Logotipos - Gas Victoria</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/10">
        <Header />
        
        <main className="flex-1 py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/configuracion')} className="shrink-0 bg-background">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Identidad Visual</h1>
                  <p className="text-muted-foreground text-sm mt-1">Sube y actualiza los logotipos de la plataforma en tiempo real.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualRefresh}
                  disabled={isFetching || isRefreshing}
                  className="bg-background shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualizando...' : 'Refrescar Vista'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Selección de Archivos</h2>
                <div className="space-y-6">
                  {LOGO_TYPES.map(typeInfo => (
                    <LogoUploadCard 
                      key={typeInfo.id}
                      typeInfo={typeInfo}
                      onUpload={handleUpload}
                      isUploading={uploadingType === typeInfo.id}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-24 pt-1">
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">Vista Previa</h2>
                  <LogotiposPreview 
                    logotipos={logotipos} 
                    isLoading={isFetching && logotipos.length === 0} 
                  />
                  
                  <div className="mt-6 bg-muted/40 border rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Los cambios se aplican automáticamente al subir un archivo. Si la imagen no cambia, usa el botón "Refrescar Vista" o limpia el caché de tu navegador.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LogotiposPage;