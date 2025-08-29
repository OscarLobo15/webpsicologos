import { useState, useEffect, useCallback } from 'react';
import StorageService from './StorageService';

/**
 * Hook personalizado para cargar datos con caché local
 * @param {Function} fetchFunction - Función para cargar datos desde la API
 * @param {string} cacheKey - Clave para guardar los datos en localStorage
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - Estado actual de los datos, carga y errores
 */
export const useDataLoader = (fetchFunction, cacheKey, options = {}) => {
  const { 
    expirationMinutes = 60, // 1 hora por defecto
    dependencies = [], 
    initialData = null,
    autoLoad = true,
    transform = (data) => data // Función para transformar datos si es necesario
  } = options;
  
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const loadData = useCallback(async (forceReload = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Intentar cargar datos desde caché si no es forzado
      if (!forceReload) {
        const cachedData = StorageService.getFromStorage(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setLastUpdated(new Date());
          return cachedData;
        }
      }
      
      // Cargar datos frescos desde la API
      const freshData = await fetchFunction();
      const transformedData = transform(freshData);
      
      // Guardar en caché y actualizar estado
      StorageService.saveToStorage(cacheKey, transformedData, expirationMinutes);
      setData(transformedData);
      setLastUpdated(new Date());
      
      return transformedData;
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar datos');
      
      // Si hay un error, intentar usar caché aunque haya sido solicitado forzar recarga
      if (forceReload) {
        const cachedData = StorageService.getFromStorage(cacheKey);
        if (cachedData) {
          setData(cachedData);
          return cachedData;
        }
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, expirationMinutes, fetchFunction, transform]);
  
  const refresh = useCallback(() => loadData(true), [loadData]);
  
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
    // No incluir loadData en dependencias para evitar ciclo infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, autoLoad]);
  
  return { 
    data, 
    loading, 
    error, 
    refresh, 
    lastUpdated,
    loadData
  };
};

/**
 * Hook para verificar si hay datos nuevos disponibles
 * @param {Function} checkFunction - Función que verifica si hay cambios
 * @param {string} cacheKey - Clave de los datos en caché
 * @param {number} intervalMinutes - Intervalo de verificación en minutos
 */
export const useDataRefreshChecker = (checkFunction, cacheKey, intervalMinutes = 5) => {
  const [hasNewData, setHasNewData] = useState(false);
  
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const newData = await checkFunction();
        const hasChanged = StorageService.hasDataChanged(cacheKey, newData);
        setHasNewData(hasChanged);
      } catch (error) {
        console.error('Error al verificar actualizaciones:', error);
      }
    };
    
    // Verificar inmediatamente al montar el componente
    checkForUpdates();
    
    // Establecer intervalo para verificar periódicamente
    const intervalId = setInterval(checkForUpdates, intervalMinutes * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [cacheKey, checkFunction, intervalMinutes]);
  
  return { hasNewData, resetNewDataFlag: () => setHasNewData(false) };
};
