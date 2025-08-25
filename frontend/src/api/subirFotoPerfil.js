import { supabase } from "../utils/supabaseClient";

/**
 * Sube una foto de perfil al servidor y actualiza el perfil del usuario
 * @param {File} file - Archivo de imagen a subir
 * @param {string} token - Token de autenticación del usuario
 * @returns {Promise<{success: boolean, url: string, message: string}>} Resultado de la operación
 */
export async function subirFoto(file, token) {
  if (!file) {
    return { success: false, message: "No se ha proporcionado ningún archivo" };
  }

  try {
    // Si estamos en el proceso de registro y no tenemos token
    if (typeof token !== 'string' || !token.startsWith("eyJ")) {
      // Usamos la compatibilidad con la versión anterior (Supabase)
      const userId = token; // En este caso token sería userId
      return await subirFotoSupabase(file, userId);
    }

    // Si tenemos token, usamos la API
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('photo', file);

    // Enviar la foto al servidor
    const response = await fetch('http://localhost:5000/api/profile/photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        url: result.photoUrl,
        message: "Foto subida correctamente"
      };
    } else {
      return {
        success: false,
        message: result.message || "Error al subir la foto"
      };
    }
  } catch (error) {
    console.error("Error al subir la foto:", error);
    return {
      success: false,
      message: "Error al comunicarse con el servidor"
    };
  }
}

/**
 * Función para compatibilidad con código existente
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo a subir
 * @param {string} userId - Identificador del usuario
 * @returns {Promise<string>} URL de la imagen subida
 */
async function subirFotoSupabase(file, userId) {
  if (!file || !userId) return null;
  
  try {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}_${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage.from('fotosperfil').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
    if (error) {
      console.error("Error subiendo a Supabase:", error);
      return { success: false, message: error.message };
    }
    
    // Obtener URL pública
    const { data: publicUrl } = supabase.storage.from('fotosperfil').getPublicUrl(filePath);
    return { 
      success: true, 
      url: publicUrl?.publicUrl || null,
      message: "Foto subida correctamente"
    };
  } catch (error) {
    console.error("Error en subirFotoSupabase:", error);
    return { success: false, message: "Error al subir la foto" };
  }
}

// Función para compatibilidad con código existente
export async function subirFotoPerfil(file, userId) {
  const result = await subirFotoSupabase(file, userId);
  return result?.url || null;
}
