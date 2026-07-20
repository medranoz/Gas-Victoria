import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { usePDFExport } from '@/hooks/usePDFExport.js';
import { FileDown } from 'lucide-react';

const DownloadPDFButton = ({ record, variant = "outline", className = "" }) => {
  const { generatePDF, isExporting } = usePDFExport();

  const handleDownload = async () => {
    if (!record) return;
    await generatePDF(record);
  };

  return (
    <Button 
      variant={variant} 
      className={className} 
      onClick={handleDownload} 
      disabled={isExporting || !record}
    >
      <FileDown className="w-4 h-4 mr-2" />
      {isExporting ? 'Generando...' : 'Descargar PDF'}
    </Button>
  );
};

export default DownloadPDFButton;