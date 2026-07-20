import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button.jsx';
import { Flame, Users, ShoppingCart, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { getLogoCacheUrl } from '@/lib/logoUploadUtil.js';

const HomePage = () => {
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

  const features = [
    {
      icon: Users,
      title: 'Gestión de clientes',
      description: 'Administra tu base de clientes con recordatorios automáticos de próximas ventas y seguimiento detallado.'
    },
    {
      icon: ShoppingCart,
      title: 'Control de ventas',
      description: 'Registra y da seguimiento a cada venta desde la captura hasta la liquidación con flujos de trabajo optimizados.'
    },
    {
      icon: MapPin,
      title: 'Rutas y zonas',
      description: 'Organiza tus operaciones por zonas geográficas y optimiza las rutas de distribución de gas.'
    }
  ];

  const benefits = [
    'Control total de inventario de tanques',
    'Gestión de usuarios con roles específicos',
    'Reportes y estadísticas en tiempo real',
    'Sistema de recordatorios automáticos',
    'Seguimiento de estatus de ventas',
    'Interfaz intuitiva y fácil de usar'
  ];

  return (
    <>
      <Helmet>
        <title>Gas Victoria - Sistema de gestión de gas LP</title>
        <meta name="description" content="Sistema completo de gestión para distribuidoras de gas LP. Controla clientes, ventas, rutas y tanques desde una sola plataforma." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex justify-center mb-8">
                  {logoUrl && !logoError ? (
                    <img 
                      src={logoUrl} 
                      alt="Gas Victoria Hero" 
                      className="max-h-[120px] w-auto object-contain drop-shadow-sm"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                      <Flame className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance" style={{letterSpacing: '-0.02em'}}>
                  Sistema de gestión para distribuidoras de gas LP
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
                  Optimiza tus operaciones con nuestro sistema de gestión. Control completo de clientes, ventas, rutas y tanques desde una plataforma centralizada.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button size="lg" className="text-lg px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]">
                      Iniciar sesión
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Funcionalidades principales</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Todo lo que necesitas para gestionar tu distribuidora de gas de manera eficiente
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
                      Beneficios del sistema
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                      Gas Victoria te proporciona las herramientas necesarias para llevar tu negocio al siguiente nivel con tecnología moderna y confiable.
                    </p>
                    <ul className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-card rounded-2xl p-8 shadow-lg border relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 pointer-events-none"></div>
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                      <Flame className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Acceso al sistema</h3>
                    <p className="text-muted-foreground mb-8">
                      Ingresa con tus credenciales proporcionadas por el administrador para comenzar a gestionar tus operaciones hoy mismo.
                    </p>
                    <Link to="/login">
                      <Button className="w-full shadow-sm" size="lg">
                        Ir al panel de control
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;