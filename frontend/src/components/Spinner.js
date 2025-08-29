import React from 'react';
import './Spinner.css';

const Spinner = ({ message = "Cargando..." }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
};

export default Spinner;
