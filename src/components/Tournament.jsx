import React, { useState } from 'react';
import { Card } from './Card';
import { fetchRandomPokemon } from '../services/pokemonService';

export function Tournament({ collection, coins, onSpendCoins, onAddCoins }) {
  const [stage, setStage] = useState(0); // 0: Inicio, 1: Draft, 2: Combate, 3: Victoria, -1: Eliminado
  const [round, setRound] = useState(1);
  const [draft, setDraft] = useState([]);
  const [faintedIds, setFaintedIds] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [rivalCard, setRivalCard] = useState(null);
  const [message, setMessage] = useState('Inscríbete por 50 monedas y vence cinco fases para ganar el premio de 150.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enterTournament = () => {
    if (coins < 50) {
      setMessage('Necesitas 50 monedas para inscribirte en el torneo.');
      return;
    }
    if (collection.length < 5) {
      setMessage('Necesitas al menos 5 cartas en tu colección para jugar el torneo.');
      return;
    }
    onSpendCoins(50);
    setStage(1);
    setMessage('Selecciona tu equipo de 5 cartas para competir en el Torneo.');
    setError('');
  };

  const toggleDraftCard = (pokemon) => {
    if (draft.some(p => p.id === pokemon.id)) {
      setDraft(draft.filter(p => p.id !== pokemon.id));
    } else {
      if (draft.length < 5) {
        setDraft([...draft, pokemon]);
      }
    }
  };

  const startFights = () => {
    setStage(2);
    setMessage(`Fase ${round} de 5. Selecciona qué carta del equipo enviarle al rival.`);
  };

  const handleFight = async (pokemon) => {
    if (loading || faintedIds.includes(pokemon.id)) return;
    setSelectedCard(pokemon);
    setLoading(true);
    setError('');

    try {
      const rival = await fetchRandomPokemon([pokemon.id, ...draft.map(p => p.id)]);
      rival.totalPower += round * 20;
      setRivalCard(rival);

      setTimeout(() => {
        setFaintedIds((prev) => (prev.includes(pokemon.id) ? prev : [...prev, pokemon.id]));
        if (pokemon.totalPower > rival.totalPower) {
          if (round === 5) {
            onAddCoins(150);
            setStage(3);
            setMessage('🏆 ¡CAMPEÓN DEL TORNEO! Has ganado el premio de 150 🪙.');
          } else {
            setRound(r => r + 1);
            setMessage(`¡Avanzas a la Fase ${round + 1} de 5! Elige una carta disponible para continuar.`);
          }
        } else {
          setStage(-1);
          setMessage(`Eliminado en la Fase ${round}. La carta rival era más poderosa (${rival.totalPower} vs ${pokemon.totalPower}).`);
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('No se pudo cargar al rival del torneo:', error);
      setSelectedCard(null);
      setMessage('No se pudo cargar al rival. Comprueba tu conexión e inténtalo de nuevo.');
      setError('El rival no se pudo cargar. No se ha consumido tu carta; inténtalo otra vez.');
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStage(0);
    setRound(1);
    setDraft([]);
    setFaintedIds([]);
    setSelectedCard(null);
    setRivalCard(null);
    setError('');
    setMessage('Inscríbete por 50 monedas y vence cinco fases para ganar el premio de 150.');
  };

  return (
    <div className="view-box">
      <h2 style={{ fontFamily: 'Outfit' }}>🏆 Torneo de Élite</h2>
      <div className="tournament-status" role="status" aria-live="polite">{message}</div>
      {error && <p className="feedback-error" role="alert">{error}</p>}
      {stage > 0 && stage < 3 && (
        <div className="tournament-progress" aria-label={`Fase ${round} de 5`}>
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={index + 1 < round ? 'complete' : index + 1 === round ? 'current' : ''}>
              {index + 1}
            </span>
          ))}
          <strong>FASE {round} / 5</strong>
        </div>
      )}

      {stage === 0 && (
        <button className="btn-action" onClick={enterTournament} disabled={coins < 50}>Entrar al Torneo (50 🪙)</button>
      )}

      {stage === 1 && (
        <div>
          <h3 style={{ marginBottom: '10px' }}>Arma tu mazo del Torneo ({draft.length} / 5):</h3>
          <div className="cards-grid">
            {collection.map(p => (
              <Card 
                key={p.uniqueKey} 
                pokemon={p} 
                onClick={toggleDraftCard} 
                isSelected={draft.some(d => d.id === p.id)} 
              />
            ))}
          </div>
          {draft.length === 5 && (
            <button className="btn-action" style={{ marginTop: '20px' }} onClick={startFights}>
              Confirmar Equipo e Iniciar Fase 1 🚀
            </button>
          )}
        </div>
      )}

      {stage === 2 && (
        <div>
          <div className="battle-board">
            <div>
              <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>Tu Carta</h4>
              <Card pokemon={selectedCard} />
            </div>
            <div className="vs-text">VS</div>
            <div>
              <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>Rival de Fase {round}</h4>
              <Card pokemon={rivalCard} />
            </div>
          </div>

          <h3 style={{ marginBottom: '15px' }}>Elige una carta sin usar: cada Pokémon solo puede competir una vez.</h3>
          <div className="cards-grid">
            {draft.map(p => (
              <Card 
                key={p.uniqueKey} 
                pokemon={p} 
                onClick={handleFight} 
                isUsed={faintedIds.includes(p.id)} 
              />
            ))}
          </div>
        </div>
      )}

      {(stage === 3 || stage === -1) && (
        <button className="btn-action" onClick={resetAll}>Volver al Menú del Torneo 🔄</button>
      )}
    </div>
  );
}