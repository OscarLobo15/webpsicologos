import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const PsychologistLandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pt-28">

        {/* Hero Section */}
        <section className="relative bg-blue-700 text-white py-20 px-8 rounded-3xl shadow-2xl mb-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill="url(#gradient)" />
              <circle cx="20" cy="20" r="15" fill="rgba(255,255,255,0.1)" />
              <circle cx="80" cy="80" r="20" fill="rgba(255,255,255,0.1)" />
              <circle cx="50" cy="10" r="10" fill="rgba(255,255,255,0.1)" />
            </svg>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-extrabold mb-4 leading-tight">
              Expande tu Consulta con <span className="text-blue-200">PsicoConecta</span>
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Llega a más pacientes y gestiona tu práctica de forma eficiente.
              Únete a la red de psicólogos más grande.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-200 text-blue-800 px-8 py-4 rounded-xl shadow-lg hover:bg-blue-300 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
              >
                Crear Cuenta
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-blue-700 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-6xl mx-auto bg-white p-10 rounded-3xl shadow-2xl mb-12">
          <h3 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">
            ¿Cómo Funciona?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-2xl shadow-md border border-blue-100">
              <h4 className="text-xl font-bold text-blue-700 mb-3">1. Regístrate y Crea tu Perfil</h4>
              <p className="text-gray-600">Completa tu información profesional, especialidades y experiencia.</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-2xl shadow-md border border-blue-100">
              <h4 className="text-xl font-bold text-blue-700 mb-3">2. Sé Visible para Miles</h4>
              <p className="text-gray-600">Aparece en las búsquedas de pacientes que buscan tus servicios.</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-2xl shadow-md border border-blue-100">
              <h4 className="text-xl font-bold text-blue-700 mb-3">3. Gestiona tus Citas</h4>
              <p className="text-gray-600">Recibe y organiza solicitudes de citas desde nuestra plataforma.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-2xl mb-12">
          <h3 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">
            Planes de Suscripción
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-8 rounded-2xl shadow-lg border border-blue-200 text-center">
              <h4 className="text-2xl font-bold text-blue-700 mb-4">Plan Básico</h4>
              <p className="text-5xl font-extrabold text-blue-800 mb-4">$299 <span className="text-xl text-gray-600">/ mes</span></p>
              <ul className="text-gray-700 text-left mb-6 space-y-2">
                <li>✔ Perfil público en PsicoConecta</li>
                <li>✔ Gestión de citas básica</li>
                <li>✔ Soporte por email</li>
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors font-semibold"
              >
                Elegir Plan Básico
              </button>
            </div>

            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg border border-blue-400 text-center relative">
              <div className="absolute top-0 right-0 bg-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <h4 className="text-2xl font-bold mb-4">Plan Premium</h4>
              <p className="text-5xl font-extrabold mb-4">$499 <span className="text-xl opacity-80">/ mes</span></p>
              <ul className="text-left mb-6 space-y-2 opacity-90">
                <li>✔ Todo lo del Plan Básico</li>
                <li>✔ Posicionamiento destacado</li>
                <li>✔ Estadísticas avanzadas</li>
                <li>✔ Soporte prioritario</li>
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-blue-200 text-blue-800 py-3 rounded-xl shadow-md hover:bg-blue-300 transition-colors font-semibold"
              >
                Elegir Plan Premium
              </button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-4xl mx-auto bg-blue-500 text-white p-10 rounded-3xl shadow-2xl text-center">
          <h3 className="text-3xl font-extrabold mb-4">
            ¿Listo para Conectar con Más Pacientes?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a PsicoConecta hoy y transforma tu práctica profesional.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-700 px-10 py-4 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
          >
            Regístrate Ahora
          </button>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default PsychologistLandingPage;