import React, { useState } from 'react';
import { Card } from './Card';
import { fetchUniquePokemonBatch } from '../services/pokemonService';

export function PackOpening({ coins, collection, onSpendCoins, onAddCardsToCollection }) {
  const [opening, setOpening] = useState(false);
  const [newCards, setNewCards] = useState([]);
  const [error, setError] = useState('');

  const openPack = async () => {
    if (coins < 50) {
      setError('Necesitas 50 monedas para abrir un sobre.');
      return;
    }

    setOpening(true);
    setNewCards([]);
    setError('');

    try {
      const ownedIds = collection.map((pokemon) => pokemon.id);
      const pulled = await fetchUniquePokemonBatch(3, ownedIds);
      if (pulled.length === 0) {
        throw new Error('Ya has conseguido todos los Pokémon disponibles.');
      }

      onSpendCoins(50);
      setNewCards(pulled);
      onAddCardsToCollection(pulled);
    } catch (requestError) {
      console.error('No se pudo abrir el sobre:', requestError);
      setError(requestError.message || 'No se pudo conectar con PokéAPI. Inténtalo de nuevo.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="view-box" style={{ textAlign: 'center', alignItems: 'center' }}>
      <h2 style={{ fontFamily: 'Outfit' }}>🎁 Tienda de Sobres TCG</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Abre un sobre por 50 monedas y consigue 3 Pokémon aleatorios con animación de apertura.
      </p>
      {error && <p className="feedback-error" role="alert">{error}</p>}

      {newCards.length === 0 ? (
        <div className="pack-opening-area">
          <button
            className={`pack-card-visual ${opening ? 'shaking' : ''}`}
            onClick={openPack}
            disabled={opening}
            type="button"
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🎁</div>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 'bold' }}>Sobre Místico</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>50 🪙</div>
          </button>

          <button className="btn-action" onClick={openPack} disabled={opening}>
            {opening ? '¡Abriendo Sobre...' : 'Abrir Sobre (50 🪙)'}
          </button>
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <h3 style={{ color: 'var(--accent-green)', marginBottom: '20px' }}>
            🎉 ¡Cartas Desbloqueadas!
          </h3>
          <div className="cards-grid">
            {newCards.map((c, idx) => (
              <div key={c.uniqueKey} className="revealing" style={{ animationDelay: `${idx * 0.2}s` }}>
                <Card pokemon={c} />
              </div>
            ))}
          </div>
          <button className="btn-action" style={{ marginTop: '25px' }} onClick={() => setNewCards([])}>
            Abrir Otro Sobre
          </button>
        </div>
      )}
    </div>
  );
}