import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[AuthFlow] Initializing AuthContext (On Mount)');
    console.log('[AuthFlow] Initial AuthStore state:', { 
      isValid: pb.authStore.isValid, 
      hasToken: !!pb.authStore.token,
      tokenPreview: pb.authStore.token ? `${pb.authStore.token.substring(0, 10)}...` : null
    });

    if (pb.authStore.isValid && pb.authStore.model) {
      const user = { ...pb.authStore.model };
      user.role = user.role || '';
      
      console.log('[AuthFlow] Loaded User Object from AuthStore:', user);
      
      // Validate expected structure
      if (!user.id || !user.email || !user.role) {
        console.warn('[AuthFlow] WARNING: Loaded user is missing standard properties (id, email, or role).', user);
      }

      setCurrentUser(user);
    } else {
      console.log('[AuthFlow] No valid session found in AuthStore.');
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('[AuthFlow] 1. Pre-login validation:', { 
      emailProvided: !!email, 
      emailValue: email,
      passwordLength: password?.length || 0 
    });

    if (!email || !password) {
      const err = new Error('El correo electrónico y la contraseña son obligatorios.');
      console.error('[AuthFlow] ERROR:', err.message);
      throw err;
    }

    try {
      console.log(`[AuthFlow] 2. Attempting login request to PocketBase for email: ${email}`);
      
      // We pass email and password directly to authWithPassword
      const authData = await pb.collection('users').authWithPassword(email, password, { 
        $autoCancel: false 
      });
      
      console.log('[AuthFlow] 3. Login successful. Full AuthData response:', authData);
      console.log('[AuthFlow] 4. Token storage validation:', {
        inAuthStore: !!pb.authStore.token,
        tokenLength: pb.authStore.token?.length,
        isValid: pb.authStore.isValid
      });
      
      const user = { ...authData.record };
      user.role = user.role || '';
      
      console.log('[AuthFlow] 5. Parsed User Object to set in state:', user);
      
      if (!user.id || !user.email || !user.role) {
        console.warn('[AuthFlow] WARNING: API returned user object missing required fields (id, email, role).', user);
      }
      
      setCurrentUser(user);
      navigate('/dashboard');
      
      return authData;
    } catch (error) {
      console.error('[AuthFlow] ERROR: Login request failed.');
      console.error('[AuthFlow] ERROR Status:', error.status);
      console.error('[AuthFlow] ERROR Message:', error.message);
      console.error('[AuthFlow] ERROR Full Response Body:', error.response);
      throw error;
    }
  };

  const logout = () => {
    console.log('[AuthFlow] Executing logout...');
    pb.authStore.clear();
    console.log('[AuthFlow] AuthStore cleared. IsValid:', pb.authStore.isValid);
    setCurrentUser(null);
    navigate('/login');
  };

  const isAuthenticated = pb.authStore.isValid;

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};