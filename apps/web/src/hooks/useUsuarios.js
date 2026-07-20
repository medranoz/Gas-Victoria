import pb from '@/lib/pocketbaseClient.js';

export const useUsuarios = () => {
  const handleError = (error, defaultMessage) => {
    console.error(`[useUsuarios] ${defaultMessage}:`, error);
    
    if (error?.status === 400) {
      const data = error?.response?.data;
      if (data) {
        if (data.email?.message) {
          if (data.email.message.includes('already in use') || data.email.message.includes('unique')) {
            return 'El correo electrónico ya está registrado en el sistema.';
          }
          return `Error en email: ${data.email.message}`;
        }
        if (data.password?.message) return `Error en contraseña: ${data.password.message}`;
        if (data.passwordConfirm?.message) return `Error en confirmación de contraseña: ${data.passwordConfirm.message}`;
        if (data.role?.message) return `Error en rol: ${data.role.message}`;
        if (data.nombre?.message) return `Error en nombre: ${data.nombre.message}`;
      }
      return 'Datos inválidos. Verifica que todos los campos requeridos estén correctos.';
    }
    
    if (error?.status === 403) {
      return 'Acceso denegado. Solo los Superadministradores pueden realizar esta acción.';
    }
    
    if (error?.status === 404) {
      return 'El usuario solicitado no fue encontrado.';
    }

    return error?.message || defaultMessage;
  };

  const getUsuarios = async (page = 1, perPage = 200) => {
    try {
      const records = await pb.collection('users').getList(page, perPage, {
        $autoCancel: false,
      });
      
      const mappedData = records.items?.map(user => ({
        id: user?.id || '',
        email: user?.email || '',
        nombre: user?.name || user?.nombre || '',
        rol: user?.role || 'Despachador',
        zona_asignada: user?.zona_asignada || '',
        estado: user?.estado || 'activo',
        fecha_creacion: user?.created || '',
      })) || [];

      return { exito: true, data: mappedData, totalItems: records.totalItems };
    } catch (error) {
      return { exito: false, error: handleError(error, 'Error al obtener la lista de usuarios') };
    }
  };

  const generarContraseñaTemporal = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const createUsuario = async (datos) => {
    try {
      if (!datos?.email || !datos?.rol || !datos?.password) {
        return { exito: false, error: 'Faltan campos requeridos (email, rol, contraseña)' };
      }

      const payload = {
        email: datos.email,
        emailVisibility: true,
        password: datos.password,
        passwordConfirm: datos.password,
        name: datos.nombre || '',
        nombre: datos.nombre || '',
        role: datos.rol,
        zona_asignada: datos.zona_asignada || '',
        estado: datos.estado || 'activo'
      };

      const record = await pb.collection('users').create(payload, { $autoCancel: false });
      return { exito: true, data: record };
    } catch (error) {
      return { exito: false, error: handleError(error, 'Error al crear el usuario') };
    }
  };

  const updateUsuario = async (id, datos) => {
    try {
      if (!id) return { exito: false, error: 'ID de usuario no proporcionado' };

      const payload = {
        name: datos.nombre || '',
        nombre: datos.nombre || '',
        role: datos.rol,
        zona_asignada: datos.zona_asignada || '',
        estado: datos.estado || 'activo'
      };

      // Only update password if provided
      if (datos.password && datos.password.trim() !== '') {
        payload.password = datos.password;
        payload.passwordConfirm = datos.password;
      }

      const record = await pb.collection('users').update(id, payload, { $autoCancel: false });
      return { exito: true, data: record };
    } catch (error) {
      return { exito: false, error: handleError(error, 'Error al actualizar el usuario') };
    }
  };

  const deleteUsuario = async (id) => {
    try {
      if (!id) return { exito: false, error: 'ID de usuario no proporcionado' };
      await pb.collection('users').delete(id, { $autoCancel: false });
      return { exito: true };
    } catch (error) {
      return { exito: false, error: handleError(error, 'Error al eliminar el usuario') };
    }
  };

  return {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    generarContraseñaTemporal
  };
};