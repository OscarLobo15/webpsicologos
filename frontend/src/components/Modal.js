import React from "react";

export default function Modal({ isOpen, onClose, onConfirm, title, message, confirmText, confirmButtonClass = "bg-blue-600" }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-fadeIn border border-gray-200">
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        )}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        
        <div className="p-6">
          {message && <p className="mb-4 text-gray-600">{message}</p>}
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded hover:opacity-90 transition-colors ${confirmButtonClass}`}
            >
              {confirmText || "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
