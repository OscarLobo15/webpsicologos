/**
 * Servicio para gestionar el almacenamiento local de datos con expiración
 */
class StorageService {
  /**
   * Guarda datos en el localStorage con una marca de tiempo
   * @param {string} key - La clave para almacenar los datos
   * @param {any} data - Los datos a almacenar
   * @param {number} expirationMinutes - Tiempo de expiración en minutos (por defecto 60 minutos = 1 hora)
   */
  static saveToStorage(key, data, expirationMinutes = 60) {
    const timestamp = new Date().getTime();
    const expiration = timestamp + (expirationMinutes * 60 * 1000);
    
    const storageItem = {
      data,
      timestamp,
      expiration,
      hash: this.generateHash(JSON.stringify(data))
    };
    
    localStorage.setItem(key, JSON.stringify(storageItem));
  }

  /**
   * Recupera datos del localStorage si no han expirado
   * @param {string} key - La clave para recuperar los datos
   * @returns {Object|null} - Los datos almacenados o null si no existen o han expirado
   */
  static getFromStorage(key) {
    const storedItem = localStorage.getItem(key);
    
    if (!storedItem) {
      return null;
    }
    
    try {
      const { data, expiration } = JSON.parse(storedItem);
      const now = new Date().getTime();
      
      if (now > expiration) {
        // Los datos han expirado, eliminarlos
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error al parsear datos del localStorage:', error);
      return null;
    }
  }

  /**
   * Verifica si los datos han cambiado comparando con los del localStorage
   * @param {string} key - La clave para verificar los datos
   * @param {any} newData - Los nuevos datos para comparar
   * @returns {boolean} - true si los datos son diferentes, false si son iguales
   */
  static hasDataChanged(key, newData) {
    const storedItem = localStorage.getItem(key);
    
    if (!storedItem) {
      return true;
    }
    
    try {
      const { hash } = JSON.parse(storedItem);
      const newHash = this.generateHash(JSON.stringify(newData));
      
      return hash !== newHash;
    } catch (error) {
      return true;
    }
  }
  
  /**
   * Genera un hash simple para los datos
   * @param {string} str - Cadena para generar el hash
   * @returns {string} - Hash generado
   */
  static generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return hash.toString();
  }
  
  /**
   * Limpia todos los datos almacenados por esta aplicación
   */
  static clearAllStoredData() {
    // Opcionalmente puedes filtrar solo las claves que pertenecen a tu app
    // usando un prefijo común, pero esto limpia todo
    localStorage.clear();
  }
}

export default StorageService;
