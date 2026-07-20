import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import pb from '@/lib/pocketbaseClient.js';
import DownloadPDFButton from './DownloadPDFButton.jsx';
import { CheckCircle2, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const EvidenceImage = ({ record, field, label }) => {
  const url = record && record[field] ? pb.files.getURL(record, record[field]) : null;
  return (
    <div className="border rounded-xl overflow-hidden bg-card/50">
      <div className="p-2 border-b bg-muted/30 text-xs font-semibold text-center">{label}</div>
      <div className="aspect-video bg-muted relative flex items-center justify-center">
        {url ? (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center">
            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-xs">Sin evidencia</span>
          </div>
        )}
      </div>
    </div>
  );
};

const MeasurementBox = ({ label, li, lf, dif }) => (
  <div className="border rounded-xl p-4 bg-card shadow-sm space-y-4">
    <h4 className="font-bold text-lg border-b pb-2">{label}</h4>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-xs text-muted-foreground font-semibold mb-1">Inicial (LI)</div>
        <div className="font-mono">{li !== undefined && li !== null ? Number(li).toFixed(2) : '-'}</div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-semibold mb-1">Final (LF)</div>
        <div className="font-mono">{lf !== undefined && lf !== null ? Number(lf).toFixed(2) : '-'}</div>
      </div>
      <div className="bg-primary/10 rounded-lg py-1 border border-primary/20">
        <div className="text-xs text-primary font-bold mb-1">Diferencia</div>
        <div className="font-mono font-bold text-lg text-primary">{dif !== undefined && dif !== null ? Number(dif).toFixed(2) : '-'}</div>
      </div>
    </div>
  </div>
);

const CapacityBox = ({ label, c1Label, c1Value, c2Label, c2Value, diffLabel, difValue }) => (
  <div className="border rounded-xl p-4 bg-card shadow-sm space-y-4">
    <h4 className="font-bold text-lg border-b pb-2 text-primary">{label}</h4>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-1 line-clamp-1" title={c1Label}>{c1Label}</div>
        <div className="font-mono">{c1Value !== undefined && c1Value !== null ? Number(c1Value).toFixed(2) : '-'}</div>
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-1 line-clamp-1" title={c2Label}>{c2Label}</div>
        <div className="font-mono">{c2Value !== undefined && c2Value !== null ? Number(c2Value).toFixed(2) : '-'}</div>
      </div>
      <div className="bg-primary/10 rounded-lg py-1 border border-primary/20">
        <div className="text-[11px] text-primary font-bold uppercase tracking-wider mb-1 line-clamp-1" title={diffLabel}>{diffLabel}</div>
        <div className="font-mono font-bold text-lg text-primary">{difValue !== undefined && difValue !== null ? Number(difValue).toFixed(2) : '-'}</div>
      </div>
    </div>
  </div>
);

const ControlRecepcionPreview = ({ record, onConfirm, onBack, isLoading }) => {
  if (!record) return null;

  const isConfirmed = record.estado_registro === 'Confirmado';
  const isComplete = record.evidencia_li_tara && record.evidencia_lf_tara && record.evidencia_li_presion && record.evidencia_lf_presion;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        <div className="flex gap-2">
          <DownloadPDFButton record={record} />
          {!isConfirmed && (
            <Button 
              onClick={() => onConfirm(record.id)} 
              disabled={isLoading || !isComplete}
              className="bg-primary hover:bg-primary/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> 
              {isLoading ? 'Confirmando...' : 'Confirmar Registro'}
            </Button>
          )}
        </div>
      </div>

      {!isComplete && !isConfirmed && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl text-sm font-medium">
          Faltan evidencias fotográficas (TARA/PRESIÓN). Debe adjuntar esas imágenes para poder confirmar el registro.
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader className="bg-muted/20 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Folio: {record.folio}</CardTitle>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isConfirmed ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'}`}>
              {record.estado_registro}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {/* Info general */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-muted-foreground text-xs">Fecha y Hora</Label>
              <div className="font-medium">{new Date(record.fecha_hora).toLocaleString()}</div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Usuario</Label>
              <div className="font-medium">{record.expand?.usuario_id?.name || record.expand?.usuario_id?.email}</div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Estación</Label>
              <div className="font-medium">{record.expand?.estacion_id?.nombre}</div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Proveedor</Label>
              <div className="font-medium">{record.expand?.proveedor_id?.razon_social}</div>
            </div>
          </div>

          {/* TARA & PRESION */}
          <div className="grid md:grid-cols-2 gap-6">
            <MeasurementBox label="Medición TARA (KG)" li={record.li_tara} lf={record.lf_tara} dif={record.dif_tara} />
            <MeasurementBox label="Medición PRESIÓN (PSI)" li={record.li_presion} lf={record.lf_presion} dif={record.dif_presion} />
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg border-b pb-2">Evidencias Fotográficas (Tara/Presión)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EvidenceImage record={record} field="evidencia_li_tara" label="LI Tara" />
              <EvidenceImage record={record} field="evidencia_lf_tara" label="LF Tara" />
              <EvidenceImage record={record} field="evidencia_li_presion" label="LI Presión" />
              <EvidenceImage record={record} field="evidencia_lf_presion" label="LF Presión" />
            </div>
          </div>

          {/* CAPACIDAD Y LITRAJE */}
          <div className="grid md:grid-cols-2 gap-6 border-t pt-8">
            <CapacityBox 
              label="Capacidad General" 
              c1Label="Total (CT) Lts" 
              c1Value={record.capacidad_total_ct} 
              c2Label="-" 
              c2Value={null} 
              diffLabel="Permitida (CP) Lts" 
              difValue={record.capacidad_permitida_cp} 
            />
            <CapacityBox 
              label="DRV (Lts)" 
              c1Label="Inicial (LTi)" 
              c1Value={record.litraje_inicial_lti} 
              c2Label="Final (LTf)" 
              c2Value={record.litraje_final_ltf} 
              diffLabel="Diferencia DRV (DifLT)" 
              difValue={record.diferencia_litraje_diflt} 
            />
            <div className="md:col-span-2">
              <CapacityBox 
                label="MAGNETEL (%)" 
                c1Label="Inicial (CDi)" 
                c1Value={record.capacidad_disponible_inicial_cdi} 
                c2Label="Final (CDf)" 
                c2Value={record.capacidad_disponible_final_cdf} 
                diffLabel="Diferencia Magnetel (DifCD)" 
                difValue={record.diferencia_capacidad_difcd} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg border-b pb-2">Evidencias Fotográficas (Capacidad y DRV)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <EvidenceImage record={record} field="evidencia_ct" label="CT" />
              <EvidenceImage record={record} field="evidencia_lti" label="DRV (LTi)" />
              <EvidenceImage record={record} field="evidencia_cdi" label="MAGNETEL (CDi)" />
              <EvidenceImage record={record} field="evidencia_ltf" label="DRV (LTf)" />
              <EvidenceImage record={record} field="evidencia_cdf" label="MAGNETEL (CDf)" />
            </div>
          </div>

          {record.observaciones && (
            <div className="space-y-2 border-t pt-6">
              <h4 className="font-bold text-lg border-b pb-2">Observaciones</h4>
              <p className="text-muted-foreground text-sm bg-muted/10 p-4 rounded-lg border">{record.observaciones}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlRecepcionPreview;