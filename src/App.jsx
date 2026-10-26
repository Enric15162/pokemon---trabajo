import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BattleArena } from './components/BattleArena';
import { Tournament } from './components/Tournament';
import { PackOpening } from './components/PackOpening';
import { CollectionAlbum } from './components/CollectionAlbum';
import { HowToPlay } from './components/HowToPlay';
import { fetchUniquePokemonBatch, sanitizeCollection } from './services/pokemonService';

export default function App() {
  const [activeTab, setActiveTab] = useState('arena');
  const [starterLoading, setStarterLoading] = useState(false);
  const [starterError, setStarterError] = useState('');
  const [starterAttempt, setStarterAttempt] = useState(0);
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('pokecard_coins');
    const parsed = Number.parseInt(saved, 10);
    return saved !== null && Number.isFinite(parsed) ? parsed : 100;
  });

  const [collection, setCollection] = useState(() => {
    const saved = localStorage.getItem('pokecard_collection');
    if (saved === null) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new Error('La colección guardada no tiene un formato válido.');
      return sanitizeCollection(parsed);
    } catch (error) {
      console.error('No se pudo leer la colección guardada:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pokecard_coins', coins);
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('pokecard_collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    if (collection.length > 0) return undefined;

    let cancelled = false;
    setStarterLoading(true);
    setStarterError('');

    fetchUniquePokemonBatch(5)
      .then((starterTeam) => {
        if (!cancelled) setCollection(sanitizeCollection(starterTeam));
      })
      .catch((error) => {
        console.error('No se pudo cargar el equipo inicial:', error);
        if (!cancelled) setStarterError('No se pudo conectar con PokéAPI. Comprueba tu conexión e inténtalo de nuevo.');
      })
      .finally(() => {
        if (!cancelled) setStarterLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [collection.length, starterAttempt]);

  const handleAddCoins = (amount) => setCoins(prev => prev + amount);
  const handleSpendCoins = (amount) => setCoins(prev => Math.max(0, prev - amount));
  const handleAddCardsToCollection = (newCards) => setCollection(prev => sanitizeCollection([...prev, ...newCards]));

  return (
    <div className="app-shell">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Pokémon · trading card experience</p>
          <h1>Entrenador, tu próxima aventura empieza aquí.</h1>
          <p className="page-intro">Construye tu equipo, domina la arena y completa tu colección.</p>
        </div>
        <div className="collection-counter" aria-label={`${collection.length} cartas en tu colección`}>
          <span className="counter-icon" aria-hidden="true">✦</span>
          <span><strong>{collection.length}</strong><small>cartas coleccionadas</small></span>
        </div>
      </header>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} coins={coins} />

      {starterLoading && collection.length === 0 && (
        <main className="view-box app-feedback" role="status">
          <span className="loading-orb" aria-hidden="true" />
          <h2>Preparando tu primera colección…</h2>
          <p>Estamos cargando tus primeras cartas desde PokéAPI.</p>
        </main>
      )}

      {starterError && collection.length === 0 && (
        <main className="view-box app-feedback" role="alert">
          <h2>No se pudo preparar la colección</h2>
          <p>{starterError}</p>
          <button className="btn-action" onClick={() => setStarterAttempt((attempt) => attempt + 1)}>
            Reintentar
          </button>
        </main>
      )}

      {collection.length > 0 && (
        <>
          {activeTab === 'arena' && (
            <BattleArena collection={collection} onAddCoins={handleAddCoins} />
          )}

          {activeTab === 'tournament' && (
            <Tournament
              collection={collection}
              coins={coins}
              onSpendCoins={handleSpendCoins}
              onAddCoins={handleAddCoins}
            />
          )}

          {activeTab === 'shop' && (
            <PackOpening
              coins={coins}
              collection={collection}
              onSpendCoins={handleSpendCoins}
              onAddCardsToCollection={handleAddCardsToCollection}
            />
          )}

          {activeTab === 'album' && (
            <CollectionAlbum collection={collection} />
          )}

          {activeTab === 'help' && (
            <HowToPlay />
          )}
        </>
      )}
    </div>
  );
}