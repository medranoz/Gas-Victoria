import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useModulos } from '@/contexts/ModulosContext.jsx';
import { toast } from 'sonner';

const ProtectedRoute = ({ children, allowedRoles, requiredRole, moduleName }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const { modules, isLoading: isModulesLoading, error: modulesError } = useModulos();
  const location = useLocation();

  useEffect(() => {
    console.log('[ProtectedRoute] Validating access for:', location.pathname, '| Required Module:', moduleName);
  }, [location.pathname, moduleName]);

  if (!isAuthenticated) {
    console.warn('[ProtectedRoute] Validation Failed: User is not authenticated.');
    setTimeout(() => {
      toast.error('Por favor, inicia sesión nuevamente');
    }, 0);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = currentUser?.role?.toLowerCase() || '';

  if (userRole === 'superadmin') {
    return children;
  }

  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    console.error(`[ProtectedRoute] Access Denied: User role (${userRole}) does not match required role (${requiredRole.toLowerCase()}).`);
    setTimeout(() => {
      toast.error('Acceso denegado. Permisos insuficientes.');
    }, 0);
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!isAllowed) {
      console.error(`[ProtectedRoute] Access Denied: User role (${userRole}) is not in allowed roles list.`);
      setTimeout(() => {
        toast.error('Acceso denegado. Permisos insuficientes.');
      }, 0);
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (moduleName) {
    if (isModulesLoading) {
      console.log(`[ProtectedRoute] Modules are still loading. Allowing fallback access to ${moduleName}.`);
      return children;
    }

    if (modulesError) {
      // CATEGORY A: EXPECTED CANCELLATION
      // PocketBase automatically cancels duplicate pending requests to prevent race conditions.
      // This commonly occurs during rapid navigation or React StrictMode double-renders.
      const isAbortError = 
        modulesError.name === 'AbortError' || 
        modulesError.isAbort === true || 
        (modulesError.message && modulesError.message.toLowerCase().includes('abort'));

      if (isAbortError) {
        // Suppress expected AbortError to prevent console noise
        console.log(`[ProtectedRoute] Suppressed expected network AbortError for module validation: ${moduleName}`);
      } else {
        // Only log actual functional defects or network failures
        console.warn(`[ProtectedRoute] Modules context reported an error:`, modulesError);
      }
      
      // Allow fallback access to prevent blocking legitimate navigation
      return children;
    }

    if (!modules || modules.length === 0) {
      console.warn(`[ProtectedRoute] Modules context is empty. Allowing fallback access to ${moduleName} to prevent blocking.`);
      return children;
    }

    try {
      const isModuleActive = modules.some(m => 
        m.nombre && m.nombre.toLowerCase() === moduleName.toLowerCase() && m.estado === true
      );

      if (!isModuleActive) {
        console.error(`[ProtectedRoute] Access Denied: Module "${moduleName}" is not active or not found.`);
        setTimeout(() => {
          toast.error(`El módulo ${moduleName} no está activo o no tienes acceso.`);
        }, 0);
        return <Navigate to="/dashboard" replace />;
      }
    } catch (err) {
      const isAbortError = err.name === 'AbortError' || err.isAbort === true;
      if (!isAbortError) {
        console.error(`[ProtectedRoute] Error validating module ${moduleName}:`, err);
      }
      // Fallback to allow access if validation logic fails unexpectedly
      return children;
    }
  }

  return children;
};

export default ProtectedRoute;