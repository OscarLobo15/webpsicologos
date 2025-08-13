import { supabase } from "../utils/supabaseClient";

export async function subirFotoPerfil(file, userId) {
  if (!file || !userId) return null;
  const ext = file.name.split('.').pop();
  const filePath = `${userId}_${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('fotosperfil').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });
  if (error) return null;
  // Obtener URL pública
  const { data: publicUrl } = supabase.storage.from('fotosperfil').getPublicUrl(filePath);
  return publicUrl?.publicUrl || null;
}
