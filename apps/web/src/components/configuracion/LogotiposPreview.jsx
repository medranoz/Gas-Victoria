import React, { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import pb from '@/lib/pocketbaseClient.js';

const LogoImageFallback = ({ logoData, altText, className }) => {
  const [imgError, setImgError] = useState(false);

  // 6. Add error boundary for image loading errors (graceful fallback)
  if (logoData && logoData.url && !imgError) {
    return (
      <img 
        src={logoData.url} 
        alt={altText} 
        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${className || ''}`} 
        onError={(e) => {
          console.error(`[LogotiposPreview] Error loading image for ${altText} from URL: ${logoData.url}`, e);
          setImgError(true);
        }}
      />
    );
  }
  
  // 5. Handle missing images gracefully with placeholder or message
  return (
    <div className="text-xs text-muted-foreground/60 italic border border-dashed border-muted-foreground/30 rounded-md w-full h-full flex items-center justify-center p-2 text-center bg-muted/20">
      {imgError ? 'Error al cargar imagen' : `Sin ${altText}`}
    </div>
  );
};

const LogotiposPreview = ({ logotipos = [], isLoading }) => {
  // 1. Check if logotipos array exists and has records
  console.log(`[LogotiposPreview] Rendering. Receiving logotipos array of length: ${logotipos?.length || 0}, isLoading: ${isLoading}`);

  const getLogoData = (tipo) => {
    // 2. Find record by tipo
    const record = logotipos.find(l => l.tipo === tipo);
    if (!record) {
      console.log(`[LogotiposPreview] No record found in array for tipo: ${tipo}`);
      return null;
    }
    
    if (!record.archivo) {
      console.log(`[LogotiposPreview] Record found for tipo: ${tipo} but missing 'archivo' field.`);
      return { ...record, url: null };
    }

    // 3. Generate URL using pb.files.getURL with cache-busting timestamp (Date.now())
    try {
      const baseUrl = pb.files.getURL(record, record.archivo);
      const cacheBustedUrl = `${baseUrl}?t=${Date.now()}`;
      console.log(`[LogotiposPreview] Generated Cache-busted URL for ${tipo}: ${cacheBustedUrl}`);
      return { ...record, url: cacheBustedUrl };
    } catch (err) {
      console.error(`[LogotiposPreview] Error generating URL for ${tipo}:`, err);
      return { ...record, url: null };
    }
  };

  const loginLogo = getLogoData('login');
  const headerLogo = getLogoData('header');
  const dashLogo = getLogoData('dashboard');

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="w-full grid grid-cols-1 gap-8 p-4 sm:p-6 bg-[hsl(var(--config-preview-bg))] border border-[hsl(var(--config-preview-border))] rounded-2xl shadow-inner relative">
      
      <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-primary/20">
        Previsualización en vivo
      </div>

      {/* PANTALLA DE LOGIN */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">PANTALLA DE LOGIN</span>
        </div>
        <Card className="w-full bg-background/80 border overflow-hidden flex items-center justify-center p-6 sm:p-8 relative min-h-[300px]">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
          <div className="bg-card w-full max-w-[300px] p-6 rounded-2xl shadow-lg border z-10 flex flex-col items-center">
            <div className="w-full h-20 flex items-center justify-center mb-8 logo-preview-box p-3 bg-transparent border-none shadow-none">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-md" />
              ) : (
                // 4. Display image with correct sizing and alt text
                <LogoImageFallback logoData={loginLogo} altText="Logo Login" />
              )}
            </div>
            <div className="w-full space-y-4">
              <div className="w-full h-10 bg-muted/50 rounded-lg flex items-center px-3 border border-border/50">
                <Mail className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="w-full h-10 bg-muted/50 rounded-lg flex items-center px-3 border border-border/50">
                <Lock className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="w-full h-10 bg-primary rounded-lg mt-2 shadow-sm"></div>
            </div>
          </div>
        </Card>
        <p className="text-[10px] text-muted-foreground text-right">
          Última actualización: {formatTimestamp(loginLogo?.updated)}
        </p>
      </div>

      {/* INTERFAZ DE LA APP */}
      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">INTERFAZ DE LA APP</span>
        </div>
        <Card className="w-full bg-background border overflow-hidden flex flex-col h-[320px] shadow-sm">
          <div className="h-16 border-b flex items-center justify-between px-4 sm:px-6 bg-card shrink-0 shadow-sm z-10">
            <div className="h-10 w-36 flex items-center py-1 logo-preview-box bg-transparent border-none shadow-none justify-start">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-md" />
              ) : (
                // 4. Display image with correct sizing and alt text
                <LogoImageFallback logoData={headerLogo} altText="Logo Header" />
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex-1 p-6 bg-muted/20 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none p-12">
               {!isLoading && <LogoImageFallback logoData={dashLogo} altText="Logo Dashboard" className="mix-blend-multiply w-full h-full" />}
            </div>

            <div className="h-8 w-1/3 bg-card border rounded-md shadow-sm z-10"></div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 z-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-card border rounded-xl shadow-sm p-4 flex flex-col gap-2">
                  <div className="h-4 w-8 bg-muted rounded"></div>
                  <div className="h-6 w-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <p className="text-[10px] text-muted-foreground text-right">
          Última actualización: {formatTimestamp(headerLogo?.updated)}
        </p>
      </div>
      
    </div>
  );
};

export default LogotiposPreview;