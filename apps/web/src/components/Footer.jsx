import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { getLogoCacheUrl } from '@/lib/logoUploadUtil.js';

const Footer = () => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchLogo = async () => {
      try {
        const record = await pb.collection('logotipos').getFirstListItem('tipo="header"', { $autoCancel: false });
        if (mounted && record && record.archivo) {
          const url = pb.files.getURL(record, record.archivo);
          setLogoUrl(getLogoCacheUrl(url));
          setLogoError(false);
        }
      } catch (err) {
        if (mounted) setLogoError(true);
      }
    };
    fetchLogo();
    return () => { mounted = false; };
  }, []);

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            {logoUrl && !logoError ? (
              <img 
                src={logoUrl} 
                alt="Gas Victoria" 
                className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-secondary/80">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Gas Victoria</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Política de privacidad
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Términos de servicio
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CRM-LP. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;