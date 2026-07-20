import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useModulosConfig } from '@/hooks/useModulosConfig.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Download, Wrench, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const ModuleDiagnosticPage = () => {
  const navigate = useNavigate();
  const { modules, loading, getModuleIntegrity, repairModule, syncNow } = useModulosConfig();
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [report, setReport] = useState({ total: 0, valid: 0, warnings: 0, errors: 0, details: [] });
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate a deep scan process for UX
    const timer = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          generateReport();
          setIsScanning(false);
          return 100;
        }
        return p + 20;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [modules, loading]);

  const generateReport = () => {
    let valid = 0;
    let warnings = 0;
    let errors = 0;
    const details = [];

    modules.forEach(mod => {
      const integrity = getModuleIntegrity(mod);
      
      if (integrity.status === 'valid') valid++;
      if (integrity.status === 'warning') warnings++;
      if (integrity.status === 'error') errors++;

      details.push({
        id: mod.id,
        nombre: mod.nombre,
        status: integrity.status,
        issues: integrity.issues,
        raw: mod
      });
    });

    setReport({
      total: modules.length,
      valid,
      warnings,
      errors,
      details: details.sort((a, b) => {
        const priority = { 'error': 0, 'warning': 1, 'valid': 2 };
        return priority[a.status] - priority[b.status];
      })
    });
  };

  const handleAutoRepairAll = async () => {
    setIsRepairing(true);
    const modulesToRepair = report.details.filter(d => d.status !== 'valid').map(d => d.raw);
    
    let successCount = 0;
    for (const mod of modulesToRepair) {
      const success = await repairModule(mod);
      if (success) successCount++;
    }
    
    toast.success(`Se completó la reparación. ${successCount} de ${modulesToRepair.length} módulos corregidos.`);
    syncNow();
    setIsRepairing(false);
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `diagnostico-modulos-${new Date().toISOString().split('T')[0]}.json`;
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] dark">
      <Helmet>
        <title>Diagnóstico de Módulos - Gas Victoria</title>
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground" onClick={() => navigate('/configuracion/modulos')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Configuración
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-primary" /> Diagnóstico del Sistema
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Análisis profundo de la integridad estructural de la base de datos de módulos, verificando referencias cruzadas y colecciones huérfanas.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={exportReport} disabled={isScanning}>
                <Download className="w-4 h-4 mr-2" /> Exportar JSON
              </Button>
              <Button 
                onClick={handleAutoRepairAll} 
                disabled={isScanning || isRepairing || (report.warnings === 0 && report.errors === 0)}
                className="bg-primary text-primary-foreground"
              >
                <Wrench className="w-4 h-4 mr-2" /> Reparar Todo
              </Button>
            </div>
          </div>
        </div>

        {isScanning ? (
          <Card className="bg-card border-border/50 shadow-lg p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              <ShieldAlert className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2 max-w-sm w-full">
              <h3 className="text-xl font-bold">Analizando integridad...</h3>
              <p className="text-sm text-muted-foreground">Verificando índices, restricciones y relaciones de {modules.length} módulos registrados.</p>
              <Progress value={scanProgress} className="h-2 mt-4" />
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Analizados</p>
                  <p className="text-4xl font-black">{report.total}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-green-600 dark:text-green-500 mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Íntegros</p>
                  <p className="text-4xl font-black text-green-700 dark:text-green-400">{report.valid}</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Advertencias</p>
                  <p className="text-4xl font-black text-yellow-700 dark:text-yellow-400">{report.warnings}</p>
                </CardContent>
              </Card>
              <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-destructive mb-1 flex items-center gap-1.5"><XCircle className="w-4 h-4"/> Errores Críticos</p>
                  <p className="text-4xl font-black text-destructive">{report.errors}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle>Reporte Detallado</CardTitle>
                <CardDescription>Resultados del escaneo por módulo individual.</CardDescription>
              </CardHeader>
              <div className="divide-y divide-border">
                {report.details.map((item) => (
                  <div key={item.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${item.status === 'error' ? 'bg-destructive/5' : item.status === 'warning' ? 'bg-yellow-500/5' : 'hover:bg-muted/30'}`}>
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {item.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                        {item.status === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">{item.nombre}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {item.id}</p>
                        
                        {item.issues.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {item.issues.map((issue, i) => (
                              <p key={i} className={`text-sm flex items-center gap-1.5 ${item.status === 'error' ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-500'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                {issue}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.status === 'valid' && (
                          <p className="text-sm text-muted-foreground mt-2">Estructura validada correctamente. Asociaciones y reglas de acceso confirmadas.</p>
                        )}
                      </div>
                    </div>
                    
                    {item.status !== 'valid' && (
                      <Button variant="outline" size="sm" onClick={() => repairModule(item.raw)} className="bg-background shrink-0 self-start">
                        <Wrench className="w-3.5 h-3.5 mr-1.5" /> Reparar
                      </Button>
                    )}
                  </div>
                ))}
                
                {report.details.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No se encontraron módulos para analizar.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ModuleDiagnosticPage;