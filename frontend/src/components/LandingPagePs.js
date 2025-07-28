import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const testimonios = [
  { nombre: "María P.", texto: "Encontré a mi psicóloga ideal en minutos. El sitio es hermoso, rápido y seguro." },
  { nombre: "Camilo V.", texto: "La atención que recibí fue excelente. Muy fácil de encontrar a alguien que me entendiera." },
];

export default function LandingPageUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/search', { state: { searchTerm } });
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-8 pt-28">
        <div className="bg-white p-10 px-12 rounded-3xl shadow-2xl max-w-6xl w-full text-center transform transition-all duration-300 hover:scale-105">
          <h2 className="text-5xl font-extrabold text-blue-800 mb-6 leading-tight">
            Encuentra tu <span className="text-blue-600">psicólogo ideal</span> hoy
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Conecta con profesionales de la salud mental que se ajusten a tus necesidades. Tu bienestar es nuestra prioridad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8 px-4">
            <input
              type="text"
              placeholder="Buscar por especialidad o nombre..."
              className="flex-grow px-6 py-3 border border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Buscar
            </button>
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">¿Por qué PsicoConecta?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
              <div className="p-6 bg-blue-50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-500 mb-3 text-center">
                  <i className="bi bi-patch-check fs-1"></i>
                </div>
                <h4 className="font-semibold text-blue-700 mb-2">Verificación Profesional</h4>
                <p className="text-sm text-gray-600">Cada psicólogo pasa por un proceso de validación de credenciales.</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-500 mb-3 text-center">
                  <i className="bi bi-people fs-1"></i>
                </div>
                <h4 className="font-semibold text-blue-700 mb-2">Atención Personalizada</h4>
                <p className="text-sm text-gray-600">Te ayudamos a encontrar el profesional más adecuado para ti.</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-500 mb-3 text-center">
                  <i className="bi bi-shield-lock fs-1"></i>
                </div>
                <h4 className="font-semibold text-blue-700 mb-2">Privacidad Garantizada</h4>
                <p className="text-sm text-gray-600">Tus datos y sesiones están protegidos bajo altos estándares.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonios */}
      <section className="bg-white py-10">
        <div className="container mx-auto">
          <h3 className="text-center text-2xl font-bold text-blue-800 mb-8">Lo que opinan nuestros usuarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
            {testimonios.map((t, index) => (
              <div key={index} className="bg-blue-50 rounded-xl shadow-md p-6">
                <p className="italic text-gray-700 mb-4">“{t.texto}”</p>
                <p className="text-end font-semibold text-blue-700">{t.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-blue-100 text-blue-800 py-12">
        <h4 className="text-3xl font-extrabold mb-6">¿Listo para comenzar tu proceso?</h4>
        <Link
          to="/search"
          className="inline-block no-underline bg-gradient-to-r from-blue-400 to-blue-600 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:from-blue-500 hover:to-blue-700 transform hover:scale-105 transition-all"
        >
          🚀 Buscar Psicólogo
        </Link>
      </section>

      <Footer />
    </>
  );
}
