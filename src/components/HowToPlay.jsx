import React from 'react';

export function HowToPlay() {
  return (
    <div className="view-box">
      <h2 style={{ fontFamily: 'Outfit' }}>❓ Guía de Juego Oficial</h2>
      
      <div className="help-step">
        <h3>1. 🃏 Selección de 5 Cartas (Draft)</h3>
        <p>Antes de combatir en la Arena o en el Torneo, debes seleccionar un equipo de <strong>5 cartas</strong> de tu colección.</p>
      </div>

      <div className="help-step">
        <h3>2. ❌ Descarte / Agotamiento</h3>
        <p>En la Arena, un Pokémon queda fuera de combate al perder todos sus PS. En el torneo, cada carta solo puede luchar una vez. Elige uno de los ataques en tu turno y vigila las barras de salud.</p>
      </div>

      <div className="help-step">
        <h3>3. 🏆 Torneo Profesional</h3>
        <p>La inscripción cuesta <strong>50 🪙</strong>. Arma un equipo de cinco cartas y supera cinco fases contra rivales cada vez más fuertes para ganar <strong>150 🪙</strong>.</p>
      </div>

      <div className="help-step">
        <h3>4. 🎁 Sobres y Pokédex</h3>
        <p>Abre sobres por <strong>50 🪙</strong> para obtener hasta 3 Pokémon que aún no tengas y completar tu Álbum Pokédex.</p>
      </div>
    </div>
  );
}