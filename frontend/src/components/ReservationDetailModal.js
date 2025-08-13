import React, { useState } from 'react';
import dayjs from 'dayjs';

export default function ReservationDetailModal({ reservation, onClose, onCancelReservation }) {
  const [cancelType, setCancelType] = useState('');
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  
  // Formatear fecha y hora
  const fechaFormateada = dayjs(reservation.fecha).format('DD/MM/YYYY');
  const hora = reservation.hora?.slice(0, 5) || '';
  const horaFin = reservation.hora_fin?.slice(0, 5) || '';
  
  // Determinar si es un bloque disponible, bloqueado o una reserva
  const esDisponible = reservation.esDisponible;
  const esBloqueado = reservation.esBloqueado;

  const handleCancelRequest = () => {
    setIsConfirmingCancel(true);
  };

  const handleConfirmCancel = () => {
    onCancelReservation(reservation.id, cancelType);
    onClose();
  };
  
  const handleBackToDetail = () => {
    setIsConfirmingCancel(false);
    setCancelType('');
  };
  
  const handleDeleteAvailability = () => {
    // Eliminar bloque de disponibilidad
    onCancelReservation(reservation.id, 'eliminar');
    onClose();
  };
  
  const handleBlockAvailability = () => {
    // Bloquear un horario disponible
    onCancelReservation(reservation.id, 'bloquear');
    onClose();
  };
  
  const handleUnblockTime = () => {
    // Desbloquear un horario bloqueado
    onCancelReservation(reservation.id, 'desbloquear');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl my-6 mx-4 md:mx-auto flex flex-col max-h-[90vh]">
        <div className={`${esDisponible ? 'bg-green-600' : esBloqueado ? 'bg-red-600' : 'bg-blue-600'} text-white p-3 z-10`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">
              {isConfirmingCancel 
                ? "Cancelar Reserva" 
                : esDisponible 
                  ? "Gestionar Bloque Disponible" 
                  : esBloqueado 
                    ? "Gestionar Bloque Bloqueado" 
                    : "Detalle de la Reserva"}
            </h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-opacity-75"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{maxHeight: 'calc(90vh - 60px - 56px)'}}>
        {!isConfirmingCancel ? (
          <>
            {/* Bloque Disponible */}
            {esDisponible && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Bloque Disponible</h3>
                <p className="text-gray-600 mb-5">Fecha: {fechaFormateada} • Horario: {hora} - {horaFin}</p>
                <div className="flex justify-center space-x-3">
                  <button 
                    onClick={handleDeleteAvailability}
                    className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Eliminar disponibilidad
                  </button>
                  <button 
                    onClick={handleBlockAvailability}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Bloquear horario
                  </button>
                </div>
              </div>
            )}
            
            {/* Bloque Bloqueado */}
            {esBloqueado && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Bloque Bloqueado</h3>
                <p className="text-gray-600 mb-5">Fecha: {fechaFormateada} • Horario: {hora} - {horaFin}</p>
                <div className="flex justify-center space-x-3">
                  <button 
                    onClick={handleDeleteAvailability}
                    className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Eliminar bloqueo
                  </button>
                  <button 
                    onClick={handleUnblockTime}
                    className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                    </svg>
                    Convertir a disponible
                  </button>
                </div>
              </div>
            )}
            
            {/* Reserva Normal */}
            {!esDisponible && !esBloqueado && reservation.noReserva && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Información no disponible</h3>
                <p className="text-gray-600 mb-5">Este bloque horario aparece como no disponible pero no tiene una reserva asociada.</p>
                <p className="text-sm text-gray-500">Puedes liberar el bloque para permitir nuevas reservas o mantenerlo bloqueado.</p>
              </div>
            )}
            
            {!esDisponible && !esBloqueado && !reservation.noReserva && (
              <div className="p-5">
                {/* Información de fecha y hora */}
                <div className="flex items-center mb-4 bg-blue-50 p-3 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Fecha y hora de la cita</h4>
                  <p className="text-base text-blue-700">{fechaFormateada} • {hora} - {horaFin}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {/* Información del paciente - Columna izquierda */}
                  <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Datos del Paciente</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 mr-3 shadow-sm">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium text-gray-900">{reservation.nombre_paciente || 'No disponible'}</p>
                      </div>
                    </div>

                    {reservation.edad && (
                      <div className="flex items-center">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Edad</p>
                          <p className="font-medium text-gray-900">{reservation.edad} años</p>
                        </div>
                      </div>
                    )}

                    {reservation.modalidad && (
                      <div className="flex items-center">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                              reservation.modalidad.toLowerCase().includes('online') 
                                ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                : "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            }></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Modalidad</p>
                          <p className="font-medium text-gray-900">{reservation.modalidad}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  {/* Información de contacto - Columna derecha */}
                  <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Información de Contacto</h4>
                  <div className="space-y-3">
                    {reservation.email_paciente && (
                      <div className="flex items-center">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{reservation.email_paciente}</p>
                        </div>
                      </div>
                    )}

                    {reservation.telefono && (
                      <div className="flex items-center">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-medium text-gray-900">{reservation.telefono}</p>
                        </div>
                      </div>
                    )}
                    
                    {reservation.rut && (
                      <div className="flex items-center">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">RUT</p>
                          <p className="font-medium text-gray-900">{reservation.rut}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Motivo de consulta */}
              {reservation.motivo && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-1 border-b pb-1">Motivo de consulta</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-100 shadow-inner max-h-24 overflow-y-auto">
                    {reservation.motivo}
                  </div>
                </div>
              )}
            </div>
            )}
          </>
        ) : (
          <div className="p-4">
            <h4 className="font-semibold text-lg text-gray-800 mb-3 text-center">¿Qué desea hacer con este bloque horario?</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div 
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${cancelType === 'liberar' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setCancelType('liberar')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-sm">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-base text-gray-900 mb-0.5">Dejar el bloque disponible</p>
                    <p className="text-xs text-gray-600">Este horario quedará libre para nuevas reservas</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${cancelType === 'bloquear' ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300'}`}
                onClick={() => setCancelType('bloquear')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2 shadow-sm">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-base text-gray-900 mb-0.5">Bloquear este horario</p>
                    <p className="text-xs text-gray-600">Este horario quedará bloqueado y no estará disponible</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button 
                className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                onClick={handleBackToDetail}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Volver
              </button>
              <button 
                className="flex-1 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                onClick={handleConfirmCancel}
                disabled={!cancelType}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Confirmar
              </button>
            </div>
          </div>
        )}
        </div>
        
        {!isConfirmingCancel && (
          <div className="border-t px-4 py-3 bg-gray-50 flex justify-end mt-auto">
            <button 
              className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center"
              onClick={handleCancelRequest}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Cancelar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
