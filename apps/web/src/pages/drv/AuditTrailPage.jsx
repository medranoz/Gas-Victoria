import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { ShieldAlert } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';

const AuditTrailPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const records = await pb.collection('drv_audit_log').getFullList({
          sort: '-fecha_hora',
          expand: 'usuario',
          $autoCancel: false
        });
        setLogs(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet><title>Auditoría DRV - Gas Victoria</title></Helmet>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-destructive/10 p-2 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Auditoría</h1>
            <p className="text-muted-foreground">Seguimiento de operaciones en el módulo DRV</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">No hay registros de auditoría.</TableCell></TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(log.fecha_hora), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground text-xs font-semibold rounded-full uppercase tracking-wider">
                        {log.accion}
                      </span>
                    </TableCell>
                    <TableCell>{log.expand?.usuario?.email || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground break-all">
                      {log.detalles}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuditTrailPage;