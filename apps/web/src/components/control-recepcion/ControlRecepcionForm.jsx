import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useControlRecepcion } from '@/hooks/useControlRecepcion.js';
import { toast } from 'sonner';
import { CheckCircle2, Lock, Unlock, AlertCircle } from 'lucide-react';

const FileUpload = ({ label, id, onChange, required, currentFile, disabled, accept = "image/jpeg,image/png,application/pdf" }) => (
  <div className={`space-y-2 border p-4 rounded-xl transition-colors ${disabled ? 'bg-muted/50 opacity-80' : 'bg-muted/10 hover:bg-muted/20'}`}>
    <Label htmlFor={id} className={`font-semibold ${disabled ? 'text-muted-foreground' : ''}`}>
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <Input 
      id={id}
      type="file" 
      accept={accept} 
      onChange={(e) => onChange(id, e.target.files[0])}
      disabled={disabled}
      className={`cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${disabled ? 'file:bg-muted file:text-muted-foreground' : 'file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'}`}
    />
    {currentFile && <p className="text-xs text-primary font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Archivo cargado previamente</p>}
  </div>
);

const ControlRecepcionForm = ({ initialData, onSubmit, isLoading, liEstablished, setLiEstablished }) => {
  const [estaciones, setEstaciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const { 
    validateLIEstablishment, 
    validateLFValues, 
    calculateDifferences,
    validateCapacityFields,
    validateFinalCapacityFields,
    validateLitrajeSecurityRule,
    validateCapacidadSecurityRule,
    calculateCapacidadPermitida,
    calculateDiferenciaLitraje,
    calculateDiferenciaCapacidad
  } = useControlRecepcion();
  
  // Local fallback for state if not provided via props (e.g. edit mode)
  const [localLiEstablished, setLocalLiEstablished] = useState(false);
  const isLiSet = liEstablished !== undefined ? liEstablished : localLiEstablished;
  
  const handleSetLi = (val) => {
    if (setLiEstablished) setLiEstablished(val);
    else setLocalLiEstablished(val);
  };

  const [formData, setFormData] = useState({
    folio: '',
    estacion_id: '',
    proveedor_id: '',
    observaciones: '',
    li_tara: '',
    lf_tara: '',
    li_presion: '',
    lf_presion: '',
    capacidad_total_ct: '',
    litraje_inicial_lti: '',
    capacidad_disponible_inicial_cdi: '',
    litraje_final_ltf: '',
    capacidad_disponible_final_cdf: '',
  });

  const [files, setFiles] = useState({
    evidencia_li_tara: null,
    evidencia_lf_tara: null,
    evidencia_li_presion: null,
    evidencia_lf_presion: null,
    evidencia_ct: null,
    evidencia_lti: null,
    evidencia_cdi: null,
    evidencia_ltf: null,
    evidencia_cdf: null,
  });

  useEffect(() => {
    const fetchSelects = async () => {
      try {
        const ests = await pb.collection('estaciones').getFullList({ filter: "rol='PLANTA'", $autoCancel: false });
        setEstaciones(ests);
        const provs = await pb.collection('proveedores').getFullList({ filter: "estado='Activo'", $autoCancel: false });
        setProveedores(provs);
      } catch (err) {
        console.error("Select fetch error", err);
      }
    };
    fetchSelects();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        folio: initialData.folio || '',
        estacion_id: initialData.estacion_id || '',
        proveedor_id: initialData.proveedor_id || '',
        observaciones: initialData.observaciones || '',
        li_tara: initialData.li_tara !== undefined ? initialData.li_tara : '',
        lf_tara: initialData.lf_tara !== undefined ? initialData.lf_tara : '',
        li_presion: initialData.li_presion !== undefined ? initialData.li_presion : '',
        lf_presion: initialData.lf_presion !== undefined ? initialData.lf_presion : '',
        capacidad_total_ct: initialData.capacidad_total_ct !== undefined ? initialData.capacidad_total_ct : '',
        litraje_inicial_lti: initialData.litraje_inicial_lti !== undefined ? initialData.litraje_inicial_lti : '',
        capacidad_disponible_inicial_cdi: initialData.capacidad_disponible_inicial_cdi !== undefined ? initialData.capacidad_disponible_inicial_cdi : '',
        litraje_final_ltf: initialData.litraje_final_ltf !== undefined ? initialData.litraje_final_ltf : '',
        capacidad_disponible_final_cdf: initialData.capacidad_disponible_final_cdf !== undefined ? initialData.capacidad_disponible_final_cdf : '',
      });
      if (initialData.li_tara !== undefined && initialData.li_presion !== undefined && initialData.li_tara !== '' && initialData.li_presion !== '' && initialData.capacidad_total_ct !== undefined && initialData.capacidad_total_ct !== '') {
        handleSetLi(true);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (id, file) => {
    setFiles(prev => ({ ...prev, [id]: file }));
  };

  const onEstablishLI = () => {
    const validation = validateLIEstablishment(formData, files, initialData);
    if (!validation.success) {
      toast.error(validation.message);
      return;
    }
    const capValidation = validateCapacityFields(formData);
    if (!capValidation.success) {
      toast.error(capValidation.message);
      return;
    }
    handleSetLi(true);
    toast.success('Lectura Inicial Establecida');
  };

  const handleSubmit = (e, isPreview = false) => {
    e.preventDefault();
    
    if (!isLiSet) {
      toast.error('Debe establecer la Lectura Inicial (LI) primero.');
      return;
    }

    const lfValidation = validateLFValues(formData);
    if (!lfValidation.success) {
      toast.error(lfValidation.message);
      return;
    }

    const capLfValidation = validateFinalCapacityFields(formData);
    if (!capLfValidation.success) {
      toast.error(capLfValidation.message);
      return;
    }

    const litrajeSecVal = validateLitrajeSecurityRule(formData.litraje_final_ltf, formData.litraje_inicial_lti);
    if (!litrajeSecVal.success) {
      toast.error(litrajeSecVal.message);
      return;
    }

    const capSecVal = validateCapacidadSecurityRule(formData.capacidad_disponible_final_cdf, formData.capacidad_disponible_inicial_cdi);
    if (!capSecVal.success) {
      toast.error(capSecVal.message);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (!initialData?.id) {
      data.append('fecha_hora', new Date().toISOString());
      data.append('estado_registro', 'Borrador');
    }
    
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key]);
    });

    onSubmit(data, isPreview);
  };

  const difTara = calculateDifferences(formData.li_tara, formData.lf_tara);
  const difPresion = calculateDifferences(formData.li_presion, formData.lf_presion);
  
  const capPermitida = calculateCapacidadPermitida(formData.capacidad_total_ct);
  const difLitraje = calculateDiferenciaLitraje(formData.litraje_final_ltf, formData.litraje_inicial_lti);
  const difCapacidad = calculateDiferenciaCapacidad(formData.capacidad_disponible_inicial_cdi, formData.capacidad_disponible_final_cdf);

  const isLFInvalid = validateLFValues(formData).success === false || 
                      validateFinalCapacityFields(formData).success === false ||
                      validateLitrajeSecurityRule(formData.litraje_final_ltf, formData.litraje_inicial_lti).success === false ||
                      validateCapacidadSecurityRule(formData.capacidad_disponible_final_cdf, formData.capacidad_disponible_inicial_cdi).success === false;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h2 className="text-3xl font-extrabold tracking-tight">
          {initialData?.id ? 'Editar Recepción' : 'Nuevo Registro'}
        </h2>
        {formData.folio && <Badge variant="outline" className="text-sm px-3 py-1 font-mono">{formData.folio}</Badge>}
      </div>

      {/* SECTION 1: General Information */}
      <section className="form-section" data-state="completed">
        <div className="flex items-center gap-3 mb-6">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Sección 1</Badge>
          <h3 className="text-xl font-bold">Información General</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Estación <span className="text-destructive">*</span></Label>
            <Select value={formData.estacion_id} onValueChange={(v) => handleSelectChange('estacion_id', v)} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar Estación (PLANTA)" /></SelectTrigger>
              <SelectContent>
                {estaciones.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Proveedor <span className="text-destructive">*</span></Label>
            <Select value={formData.proveedor_id} onValueChange={(v) => handleSelectChange('proveedor_id', v)} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar Proveedor" /></SelectTrigger>
              <SelectContent>
                {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.razon_social}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Observaciones</Label>
            <Textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} placeholder="Notas generales sobre la recepción..." />
          </div>
        </div>
      </section>

      {/* SECTION 2: Lectura Inicial (LI) */}
      <section className="form-section" data-state={isLiSet ? "completed" : "active"}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge className={isLiSet ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary border-0"}>
              Sección 2
            </Badge>
            <h3 className="text-xl font-bold flex items-center gap-2">
              Lectura Inicial (LI)
              {isLiSet && <CheckCircle2 className="w-5 h-5 text-primary" />}
            </h3>
          </div>
          {isLiSet && (
            <Button variant="ghost" size="sm" onClick={() => handleSetLi(false)} className="text-muted-foreground hover:text-foreground">
              <Unlock className="w-4 h-4 mr-2" /> Editar LI
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LI TARA */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lectura Inicial TARA <span className="unit-badge">KG</span> <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input 
                  type="number" 
                  name="li_tara" 
                  value={formData.li_tara} 
                  onChange={handleChange} 
                  min="0" step="0.01" 
                  disabled={isLiSet}
                  className="font-mono text-lg"
                />
                {isLiSet && <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />}
              </div>
            </div>
            <FileUpload 
              id="evidencia_li_tara" 
              label="Evidencia Fotográfica" 
              onChange={handleFileChange} 
              required={!initialData?.evidencia_li_tara} 
              currentFile={initialData?.evidencia_li_tara} 
              disabled={isLiSet}
            />
          </div>

          {/* LI PRESION */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lectura Inicial PRESIÓN <span className="unit-badge">PSI</span> <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input 
                  type="number" 
                  name="li_presion" 
                  value={formData.li_presion} 
                  onChange={handleChange} 
                  min="0" step="0.01" 
                  disabled={isLiSet}
                  className="font-mono text-lg"
                />
                {isLiSet && <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />}
              </div>
            </div>
            <FileUpload 
              id="evidencia_li_presion" 
              label="Evidencia Fotográfica" 
              onChange={handleFileChange} 
              required={!initialData?.evidencia_li_presion} 
              currentFile={initialData?.evidencia_li_presion} 
              disabled={isLiSet}
            />
          </div>
        </div>

        {/* NEW SUBSECTION: CAPACIDAD Y DRV INICIAL */}
        <div className="mt-10 pt-8 border-t border-border/50">
          <h4 className="text-lg font-bold mb-6 text-primary flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> CAPACIDAD Y DRV INICIAL
          </h4>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Capacidad Total del Tanque (CT) <span className="unit-badge">Lts</span> <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    name="capacidad_total_ct" 
                    value={formData.capacidad_total_ct} 
                    onChange={handleChange} 
                    min="0" step="0.01" 
                    disabled={isLiSet}
                    className="font-mono text-lg"
                  />
                  {isLiSet && <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />}
                </div>
              </div>
              <FileUpload 
                id="evidencia_ct" 
                label="Evidencia Fotográfica (Opcional)" 
                onChange={handleFileChange} 
                required={false} 
                currentFile={initialData?.evidencia_ct} 
                disabled={isLiSet}
              />
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col justify-center">
                <span className="text-sm font-semibold text-primary mb-1">Capacidad Permitida (Lts)</span>
                <span className="text-xs text-muted-foreground mb-2 font-mono">CP = CT - (CT × 10%)</span>
                <span className="text-2xl font-bold font-mono text-primary">
                  {capPermitida !== null ? capPermitida : '0.00'} <span className="text-sm font-medium">Lts</span>
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>DRV Inicial (LTi) <span className="unit-badge">Lts</span> <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      name="litraje_inicial_lti" 
                      value={formData.litraje_inicial_lti} 
                      onChange={handleChange} 
                      min="0" step="0.01" 
                      disabled={isLiSet}
                      className="font-mono text-lg"
                    />
                    {isLiSet && <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />}
                  </div>
                </div>
                <FileUpload 
                  id="evidencia_lti" 
                  label="Evidencia Fotográfica (Opcional)" 
                  onChange={handleFileChange} 
                  required={false} 
                  currentFile={initialData?.evidencia_lti} 
                  disabled={isLiSet}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>MAGNETEL Inicial (CDi) <span className="unit-badge">%</span> <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      name="capacidad_disponible_inicial_cdi" 
                      value={formData.capacidad_disponible_inicial_cdi} 
                      onChange={handleChange} 
                      min="0" max="100" step="0.01" 
                      disabled={isLiSet}
                      className="font-mono text-lg"
                    />
                    {isLiSet && <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />}
                  </div>
                </div>
                <FileUpload 
                  id="evidencia_cdi" 
                  label="Evidencia Fotográfica (Opcional)" 
                  onChange={handleFileChange} 
                  required={false} 
                  currentFile={initialData?.evidencia_cdi} 
                  disabled={isLiSet}
                />
              </div>
            </div>
          </div>
        </div>

        {!isLiSet && (
          <div className="mt-8 flex justify-end border-t pt-6">
            <Button type="button" onClick={onEstablishLI} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
              <Lock className="w-4 h-4 mr-2" /> ESTABLECER LECTURA (LI)
            </Button>
          </div>
        )}
      </section>

      {/* SECTION 3: Lectura Final (LF) */}
      <section className="form-section relative" data-state={isLiSet ? "active" : "disabled"}>
        {!isLiSet && (
          <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-background/90 px-6 py-3 rounded-full shadow-sm border flex items-center gap-2 font-medium text-muted-foreground">
              <AlertCircle className="w-5 h-5 text-primary" /> Establece la Lectura Inicial (LI) primero
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-6">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Sección 3</Badge>
          <h3 className="text-xl font-bold">Lectura Final (LF)</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LF TARA */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Lectura Final TARA <span className="unit-badge">KG</span></Label>
                <Input 
                  type="number" 
                  name="lf_tara" 
                  value={formData.lf_tara} 
                  onChange={handleChange} 
                  min="0" step="0.01" 
                  className="font-mono text-lg"
                />
              </div>
              <FileUpload 
                id="evidencia_lf_tara" 
                label="Evidencia Fotográfica" 
                onChange={handleFileChange} 
                required={!initialData?.evidencia_lf_tara} 
                currentFile={initialData?.evidencia_lf_tara} 
              />
            </div>
            
            <div className="bg-muted p-4 rounded-xl border flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Diferencia TARA <span className="unit-badge">KG</span></span>
              <span className="text-2xl font-bold font-mono text-foreground">
                {difTara !== null ? difTara : '0.00'}
              </span>
            </div>
          </div>

          {/* LF PRESION */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Lectura Final PRESIÓN <span className="unit-badge">PSI</span></Label>
                <Input 
                  type="number" 
                  name="lf_presion" 
                  value={formData.lf_presion} 
                  onChange={handleChange} 
                  min="0" step="0.01" 
                  className="font-mono text-lg"
                />
              </div>
              <FileUpload 
                id="evidencia_lf_presion" 
                label="Evidencia Fotográfica" 
                onChange={handleFileChange} 
                required={!initialData?.evidencia_lf_presion} 
                currentFile={initialData?.evidencia_lf_presion} 
              />
            </div>
            
            <div className="bg-muted p-4 rounded-xl border flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Diferencia PRESIÓN <span className="unit-badge">PSI</span></span>
              <span className="text-2xl font-bold font-mono text-foreground">
                {difPresion !== null ? difPresion : '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* NEW SUBSECTION: CAPACIDAD Y DRV FINAL */}
        <div className="mt-10 pt-8 border-t border-border/50">
          <h4 className="text-lg font-bold mb-6 text-primary flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> CAPACIDAD Y DRV FINAL
          </h4>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* LTF & Diferencia Litraje */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>DRV Final (LTf) <span className="unit-badge">Lts</span> <span className="text-destructive">*</span></Label>
                  <Input 
                    type="number" 
                    name="litraje_final_ltf" 
                    value={formData.litraje_final_ltf} 
                    onChange={handleChange} 
                    min="0" step="0.01" 
                    className="font-mono text-lg"
                  />
                </div>
                <FileUpload 
                  id="evidencia_ltf" 
                  label="Evidencia Fotográfica (Opcional)" 
                  onChange={handleFileChange} 
                  required={false} 
                  currentFile={initialData?.evidencia_ltf} 
                />
              </div>
              
              <div className="bg-muted p-4 rounded-xl border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-muted-foreground">Diferencia DRV <span className="unit-badge">Lts</span></span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-1">DifLT = LTf - LTi</span>
                </div>
                <span className="text-2xl font-bold font-mono text-foreground">
                  {difLitraje !== null ? difLitraje : '0.00'}
                </span>
              </div>
            </div>

            {/* CDF & Diferencia Capacidad */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>MAGNETEL Final (CDf) <span className="unit-badge">%</span> <span className="text-destructive">*</span></Label>
                  <Input 
                    type="number" 
                    name="capacidad_disponible_final_cdf" 
                    value={formData.capacidad_disponible_final_cdf} 
                    onChange={handleChange} 
                    min="0" max="100" step="0.01" 
                    className="font-mono text-lg"
                  />
                </div>
                <FileUpload 
                  id="evidencia_cdf" 
                  label="Evidencia Fotográfica (Opcional)" 
                  onChange={handleFileChange} 
                  required={false} 
                  currentFile={initialData?.evidencia_cdf} 
                />
              </div>
              
              <div className="bg-muted p-4 rounded-xl border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-muted-foreground">Diferencia Magnetel <span className="unit-badge">%</span></span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-1">DifCD = CDi - CDf</span>
                </div>
                <span className="text-2xl font-bold font-mono text-foreground">
                  {difCapacidad !== null ? difCapacidad : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t pt-6 justify-end">
          <Button 
            type="button" 
            variant="outline"
            disabled={isLoading || !isLiSet || isLFInvalid} 
            onClick={(e) => handleSubmit(e, false)}
            className="w-full sm:w-auto px-8"
          >
            Guardar Borrador
          </Button>
          <Button 
            type="button" 
            disabled={isLoading || !isLiSet || isLFInvalid} 
            onClick={(e) => handleSubmit(e, true)}
            className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90"
          >
            Guardar y Previsualizar
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ControlRecepcionForm;