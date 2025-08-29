// Crear perfil de usuario (POST)
exports.createProfile = async (req, res, next) => {
  try {
    const { id, tipo_usuario } = req.user;
    const data = req.body;

    // Filtramos los campos que no pertenecen a la tabla
    const safeData = { ...data };
    delete safeData.id;
    delete safeData.usuario_id;
    delete safeData.creado_en;
    delete safeData.actualizado_en;

    // Mapeo de campos del frontend a columnas de la base de datos
    if (safeData.areas && !safeData.areas_atencion) {
      safeData.areas_atencion = safeData.areas;
      delete safeData.areas;
    }
    if (safeData.formacion && !safeData.formacion_academica) {
      safeData.formacion_academica = safeData.formacion;
      delete safeData.formacion;
    }
    if (safeData.enfoque && !safeData.enfoque_terapeutico) {
      safeData.enfoque_terapeutico = safeData.enfoque;
      delete safeData.enfoque;
    }

    // Procesamos los arrays si vienen como strings separados por coma
    if (safeData.areas_atencion && typeof safeData.areas_atencion === 'string') {
      safeData.areas_atencion = safeData.areas_atencion.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    if (safeData.formacion_academica && typeof safeData.formacion_academica === 'string') {
      safeData.formacion_academica = safeData.formacion_academica.split(',').map(item => item.trim()).filter(item => item !== '');
    }

    // Asegurarse que los arrays sean JSON compatibles
    if (Array.isArray(safeData.areas_atencion)) {
      safeData.areas_atencion = safeData.areas_atencion.filter(Boolean);
    }
    if (Array.isArray(safeData.formacion_academica)) {
      safeData.formacion_academica = safeData.formacion_academica.filter(Boolean);
    }

    // Añadimos campos obligatorios
    safeData.usuario_id = id;
    safeData.creado_en = new Date();
    safeData.actualizado_en = new Date();

    const table = tipo_usuario === 'psicologo' ? 'perfiles_psicologos' : 'perfiles_clientes';
    const { data: result, error } = await supabase
      .from(table)
      .insert([safeData])
      .select();

    if (error) {
      console.error('Error de Supabase (createProfile):', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Perfil creado correctamente',
      data: result
    });
  } catch (err) {
    console.error('Error en createProfile:', err);
    res.status(500).json({
      success: false,
      message: 'Error al crear el perfil',
      error: err.message
    });
  }
};
const supabase = require('../utils/supabaseClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Configuración de multer para almacenar archivos en memoria (buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

exports.getProfile = async (req, res, next) => {
  const { id, tipo_usuario } = req.user;
  const table = tipo_usuario === 'psicologo' ? 'perfiles_psicologos' : 'perfiles_clientes';
  try {
    const { data, error } = await supabase.from(table).select('*').eq('usuario_id', id).single();
    if (error) throw error;
    res.json({ success: true, profile: data });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { id, tipo_usuario } = req.user;
    const data = req.body;
    
    console.log('Actualizando perfil para:', { id, tipo_usuario });
    console.log('Datos recibidos:', data);
    
    // Filtramos los campos que no pertenecen a la tabla
    const safeData = { ...data };
    
    // Eliminamos campos que podrían causar problemas
    delete safeData.id;
    delete safeData.usuario_id; // Este debe ser inmutable
    delete safeData.creado_en;
    delete safeData.actualizado_en;
    
    // Mapeo de campos del frontend a columnas de la base de datos
    if (safeData.areas && !safeData.areas_atencion) {
      safeData.areas_atencion = safeData.areas;
      delete safeData.areas;
    }
    
    if (safeData.formacion && !safeData.formacion_academica) {
      safeData.formacion_academica = safeData.formacion;
      delete safeData.formacion;
    }
    
    if (safeData.enfoque && !safeData.enfoque_terapeutico) {
      safeData.enfoque_terapeutico = safeData.enfoque;
      delete safeData.enfoque;
    }
    
    // Procesamos los arrays si vienen como strings separados por coma
    if (safeData.areas_atencion && typeof safeData.areas_atencion === 'string') {
      safeData.areas_atencion = safeData.areas_atencion.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    
    if (safeData.formacion_academica && typeof safeData.formacion_academica === 'string') {
      safeData.formacion_academica = safeData.formacion_academica.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    
    // Asegurarse que los arrays sean JSON compatibles
    if (Array.isArray(safeData.areas_atencion)) {
      safeData.areas_atencion = safeData.areas_atencion.filter(Boolean);
    }
    
    if (Array.isArray(safeData.formacion_academica)) {
      safeData.formacion_academica = safeData.formacion_academica.filter(Boolean);
    }

    const table = tipo_usuario === 'psicologo' ? 'perfiles_psicologos' : 'perfiles_clientes';
    console.log('Tabla a actualizar:', table);
    
    // Añadimos fecha de actualización
    safeData.actualizado_en = new Date();
    
    console.log('Datos filtrados a guardar:', safeData);
    
    const { data: result, error } = await supabase
      .from(table)
      .update(safeData)
      .eq('usuario_id', id)
      .select();
    
    if (error) {
      console.error('Error de Supabase:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }
    
    console.log('Perfil actualizado con éxito:', result);
    res.json({ 
      success: true, 
      message: 'Perfil actualizado correctamente',
      data: result 
    });
  } catch (err) { 
    console.error('Error en updateProfile:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el perfil', 
      error: err.message 
    });
  }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se ha subido ninguna imagen' });
    }

    const { id, tipo_usuario } = req.user;
    const table = tipo_usuario === 'psicologo' ? 'perfiles_psicologos' : 'perfiles_clientes';

    // Subir archivo al Storage de Supabase
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `profile-${id}-${Date.now()}.${fileExt}`;
  const bucket = 'fotosperfil';
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });
    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    // Actualizar el perfil con la URL pública
    const { error } = await supabase
      .from(table)
      .update({ foto_path: publicUrl })
      .eq('usuario_id', id);
    if (error) throw error;

    res.json({ 
      success: true, 
      photoUrl: publicUrl,
      message: 'Foto subida correctamente' 
    });
  } catch (err) {
    console.error('Error al subir la foto:', err);
    next(err);
  }
};