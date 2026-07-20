import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Flame, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { getLogoCacheUrl } from '@/lib/logoUploadUtil.js';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchLogo = async () => {
      try {
        const record = await pb.collection('logotipos').getFirstListItem('tipo="login"', { $autoCancel: false });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Sesión iniciada correctamente');
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      if (error.status === 400) {
        errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar sesión - Gas Victoria</title>
        <meta name="description" content="Inicia sesión en tu cuenta de Gas Victoria para gestionar tu distribuidora de gas LP." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-4 text-center pb-8 pt-8">
            <div className="flex justify-center mb-2">
              {logoUrl && !logoError ? (
                <img 
                  src={logoUrl} 
                  alt="Gas Victoria Login" 
                  className="max-h-[100px] w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-md">
                  <Flame className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Iniciar sesión</CardTitle>
              <CardDescription className="mt-1.5">Ingresa tus credenciales para acceder al sistema</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 text-foreground"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background/50 text-foreground"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 font-medium transition-all duration-200 active:scale-[0.98] shadow-sm"
                disabled={loading}
              >
                {loading ? 'Validando credenciales...' : 'Ingresar al panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;