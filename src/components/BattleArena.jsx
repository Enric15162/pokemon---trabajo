import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { fetchRandomPokemon } from '../services/pokemonService';

const TYPE_ADVANTAGES = {
  fire: { grass: 1.4, water: 0.75, bug: 1.35, rock: 0.8 },
  water: { fire: 1.35, ground: 1.35, rock: 1.25, grass: 0.75 },
  grass: { water: 1.35, ground: 1.35, rock: 1.15, fire: 0.8, poison: 1.1 },
  electric: { water: 1.35, flying: 1.35, ground: 0.7 },
  poison: { grass: 1.35, bug: 1.1, ground: 0.8 },
  flying: { grass: 1.25, bug: 1.2, rock: 0.8, electric: 0.9 },
  bug: { grass: 1.25, poison: 1.3, fire: 0.8 },
  ground: { fire: 1.35, electric: 1.35, poison: 1.2, rock: 1.25, flying: 0 },
  rock: { fire: 1.2, water: 0.8, flying: 1.25, bug: 1.2 },
  normal: { rock: 0.8 },
};

function getMoveSet(pokemon) {
  const typeNames = {
    fire: 'Llamarada',
    water: 'Hidrobomba',
    grass: 'Rayo Solar',
    electric: 'Trueno',
    psychic: 'Pulso Psíquico',
    ice: 'Ventisca',
    dragon: 'Pulso Dragón',
    ghost: 'Bola Sombra',
    fighting: 'A Bocajarro',
    fairy: 'Brillo Mágico',
  };

  return [
    { name: 'Ataque rápido', power: 18, type: pokemon.type, description: 'Un golpe veloz y preciso para abrir la guardia rival.' },
    { name: 'Impacto', power: 25, type: pokemon.type, description: 'Un ataque equilibrado que aprovecha la fuerza física del Pokémon.' },
    {
      name: typeNames[pokemon.type] || 'Poder elemental',
      power: 36,
      type: pokemon.type,
      special: true,
      description: `Desata la energía de tipo ${pokemon.type} de ${pokemon.name}. Los ataques son más efectivos contra ciertos tipos.`,
    },
  ];
}

function typeMultiplier(attackerType, defenderType) {
  if (!attackerType || !defenderType) return 1;
  const relation = TYPE_ADVANTAGES[attackerType]?.[defenderType];
  return relation ?? 1;
}

function calculateDamage(attacker, defender, move) {
  const variance = Math.random() * 0.18 + 0.92;
  const typeBonus = typeMultiplier(attacker.type, defender.type);
  const base = ((attacker.attack * move.power) / Math.max(18, defender.defense * 0.7)) * variance;
  const finalDamage = Math.max(12, Math.round(base * typeBonus));
  return finalDamage;
}

export function BattleArena({ collection, onAddCoins }) {
  const [draft, setDraft] = useState([]);
  const [faintedIds, setFaintedIds] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [rivalCard, setRivalCard] = useState(null);
  const [playerHp, setPlayerHp] = useState(0);
  const [rivalHp, setRivalHp] = useState(0);
  const [message, setMessage] = useState('Selecciona 5 Pokémon para formar tu equipo de batalla.');
  const [roundOver, setRoundOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [battleLog, setBattleLog] = useState(['Arena lista. Esperando inicio del duelo.']);
  const [turn, setTurn] = useState('player');
  const [pendingMove, setPendingMove] = useState(null);
  const [attackEffect, setAttackEffect] = useState('');
  const [damageFlash, setDamageFlash] = useState(null);

  useEffect(() => {
    if (!pendingMove) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setPendingMove(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [pendingMove]);

  const addLog = (entry) => {
    setBattleLog((prev) => [entry, ...prev].slice(0, 6));
  };

  const toggleDraftCard = (pokemon) => {
    if (draft.some((p) => p.id === pokemon.id)) {
      setDraft(draft.filter((p) => p.id !== pokemon.id));
      return;
    }

    if (draft.length < 5) {
      setDraft([...draft, pokemon]);
    }
  };

  const handleFight = async (pokemon) => {
    if (roundOver || loading || faintedIds.includes(pokemon.id)) return;

    setLoading(true);
    setMessage('Analizando rival...');
    addLog(`Tu ${pokemon.name} entra a la arena.`);

    try {
      const rival = await fetchRandomPokemon([pokemon.id, ...draft.map((p) => p.id)]);
      setSelectedCard(pokemon);
      setRivalCard(rival);
      setPlayerHp(pokemon.hp);
      setRivalHp(rival.hp);
      setTurn('player');
      setRoundOver(false);
      setMessage('Tu turno. Elige un ataque.');
      addLog(`${rival.name} aparece como rival.`);
    } catch (error) {
      console.error('No se pudo cargar el rival:', error);
      setMessage('No se pudo cargar el rival. Comprueba tu conexión e inténtalo de nuevo.');
      addLog('Error al conectar con PokéAPI. Puedes volver a elegir atacante.');
    } finally {
      setLoading(false);
    }
  };

  const triggerEnemyTurn = (player, rival) => {
    const enemyMoves = getMoveSet(rival);
    const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
    const enemyDamage = calculateDamage(rival, player, enemyMove);
    const nextHp = Math.max(0, playerHp - enemyDamage);

    setDamageFlash({ target: 'player', amount: enemyDamage });
    window.setTimeout(() => setDamageFlash(null), 750);
    setPlayerHp(nextHp);
    setTurn('player');
    addLog(`${rival.name} usa ${enemyMove.name} y hace ${enemyDamage} daño.`);

    if (nextHp <= 0) {
      setFaintedIds((prev) => (prev.includes(player.id) ? prev : [...prev, player.id]));
      setMessage(`¡Has perdido! ${rival.name} venció a ${player.name}.`);
      onAddCoins(1);
      setRoundOver(true);
      setTurn('enemy');
      addLog('Derrota. El rival gana la ronda.');
      return true;
    }

    setMessage('Tu turno. Elige un ataque.');
    return false;
  };

  const handleMove = (move) => {
    if (!selectedCard || !rivalCard || turn !== 'player' || roundOver) return;

    setPendingMove(null);
    setAttackEffect('player');
    window.setTimeout(() => setAttackEffect(''), 500);
    const damage = calculateDamage(selectedCard, rivalCard, move);
    const nextRivalHp = Math.max(0, rivalHp - damage);

    setDamageFlash({ target: 'rival', amount: damage });
    window.setTimeout(() => setDamageFlash(null), 750);
    setRivalHp(nextRivalHp);
    setTurn('enemy');
    addLog(`${selectedCard.name} usa ${move.name} y hace ${damage} daño.`);

    if (nextRivalHp <= 0) {
      setMessage(`¡Victoria! ${selectedCard.name} derrota a ${rivalCard.name}.`);
      onAddCoins(10);
      setRoundOver(true);
      addLog('Victoria. El enemigo queda fuera de combate.');
      return;
    }

    setMessage(`${rivalCard.name} está contraatacando...`);
    setTimeout(() => {
      setAttackEffect('rival');
      window.setTimeout(() => setAttackEffect(''), 500);
      const enemyLost = triggerEnemyTurn(selectedCard, rivalCard);
      if (!enemyLost) {
        setTurn('player');
      }
    }, 350);
  };

  const nextRound = () => {
    setSelectedCard(null);
    setRivalCard(null);
    setPlayerHp(0);
    setRivalHp(0);
    setRoundOver(false);
    setTurn('player');
    setMessage('Siguiente carta lista. Elige tu próximo atacante.');
    addLog('Nueva ronda preparada.');
  };

  const resetMatch = () => {
    setDraft([]);
    setFaintedIds([]);
    setSelectedCard(null);
    setRivalCard(null);
    setPlayerHp(0);
    setRivalHp(0);
    setRoundOver(false);
    setLoading(false);
    setTurn('player');
    setMessage('Selecciona 5 Pokémon para formar tu equipo de batalla.');
    setBattleLog(['Arena lista. Esperando inicio del duelo.']);
  };

  const teamReady = draft.length === 5;
  const battleName = selectedCard && rivalCard ? `${selectedCard.name} vs ${rivalCard.name}` : 'Random Battle';

  return (
    <div className="view-box battle-shell">
      <div className="battle-header">
        <div>
          <p className="eyebrow">Arena de batalla</p>
          <h2>Duelo de entrenadores</h2>
          <p className="section-description">Forma un equipo de cinco y elige el momento perfecto para lanzar tu ataque.</p>
        </div>
        <div className="battle-status" role="status" aria-live="polite">{message}</div>
      </div>

      <div className="battle-topbar">
        <span className="arena-tag">Battle Room</span>
        <span className="arena-status">Turno: {turn === 'player' ? 'Jugador' : 'Rival'}</span>
        <span className="arena-status">{battleName}</span>
      </div>

      {!teamReady && (
        <div className="selection-panel">
          <div className="team-picker-header">
            <h3>Selecciona tu equipo</h3>
            <span>{draft.length}/5</span>
          </div>

          <div className="team-slot-row">
            {Array.from({ length: 5 }).map((_, index) => {
              const teamMember = draft[index];
              return (
                <div key={`slot-${index}`} className={`team-slot ${teamMember ? 'filled' : ''}`}>
                  {teamMember ? <Card pokemon={teamMember} compact /> : <span>#{index + 1}</span>}
                </div>
              );
            })}
          </div>

          <div className="cards-grid">
            {collection.map((p) => (
              <Card
                key={p.uniqueKey}
                pokemon={p}
                onClick={toggleDraftCard}
                isSelected={draft.some((d) => d.id === p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {teamReady && !selectedCard && !rivalCard && (
        <div className="battle-choose-panel">
          <div className="battle-panel-header">
            <h3>Elige al atacante</h3>
            <span>Tu equipo queda agotado por ronda</span>
          </div>

          <div className="cards-grid battle-grid">
            {draft.map((p) => (
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

      {(selectedCard || rivalCard) && (
        <div className={`battle-scene ${attackEffect ? `attack-${attackEffect}` : ''}`}>
          <div className={`fighter-panel player ${turn === 'player' && !roundOver ? 'active-turn' : ''} ${attackEffect === 'player' ? 'hit-effect' : ''}`}>
            <div className="fighter-header">
              <span>Tu equipo</span>
              <strong>{selectedCard?.name || '...'}</strong>
            </div>
            <div className="fighter-art">
              {selectedCard ? <img src={selectedCard.image} alt={selectedCard.name} /> : null}
              {damageFlash?.target === 'player' && <span className="damage-number">−{damageFlash.amount}</span>}
            </div>
            <div className="hp-wrap">
              <div className="hp-label">
                <span>HP</span>
                <strong>{playerHp}/{selectedCard?.hp}</strong>
              </div>
              <div
                className="health-bar"
                role="progressbar"
                aria-label={`PS de ${selectedCard?.name}`}
                aria-valuemin="0"
                aria-valuemax={selectedCard?.hp}
                aria-valuenow={playerHp}
              >
                <span style={{ width: `${Math.min(100, (playerHp / Math.max(selectedCard?.hp || 1, 1)) * 100)}%` }} />
              </div>
            </div>
            <div className="fighter-stats">
              <span>ATK {selectedCard?.attack}</span>
              <span>DEF {selectedCard?.defense}</span>
              <span>SPD {selectedCard?.speed}</span>
            </div>
          </div>

          <div className="versus-badge">VS</div>

          <div className={`fighter-panel rival ${turn === 'enemy' && !roundOver ? 'active-turn' : ''} ${attackEffect === 'rival' ? 'hit-effect' : ''}`}>
            <div className="fighter-header">
              <span>Rival</span>
              <strong>{rivalCard?.name || '...'}</strong>
            </div>
            <div className="fighter-art rival-art">
              {rivalCard ? <img src={rivalCard.image} alt={rivalCard.name} /> : null}
              {damageFlash?.target === 'rival' && <span className="damage-number">−{damageFlash.amount}</span>}
            </div>
            <div className="hp-wrap">
              <div className="hp-label">
                <span>HP</span>
                <strong>{rivalHp}/{rivalCard?.hp}</strong>
              </div>
              <div
                className="health-bar rival-bar"
                role="progressbar"
                aria-label={`PS de ${rivalCard?.name}`}
                aria-valuemin="0"
                aria-valuemax={rivalCard?.hp}
                aria-valuenow={rivalHp}
              >
                <span style={{ width: `${Math.min(100, (rivalHp / Math.max(rivalCard?.hp || 1, 1)) * 100)}%` }} />
              </div>
            </div>
            <div className="fighter-stats">
              <span>ATK {rivalCard?.attack}</span>
              <span>DEF {rivalCard?.defense}</span>
              <span>SPD {rivalCard?.speed}</span>
            </div>
          </div>
        </div>
      )}

      {selectedCard && rivalCard && !roundOver && (
        <div className="move-panel">
          <div className="move-panel-header">
            <span>Tu movimiento</span>
            <strong>{turn === 'player' ? 'Tu turno' : 'Rival ataca'}</strong>
          </div>

          <div className="move-grid">
            {getMoveSet(selectedCard).map((move) => (
              <button
                key={move.name}
                className={`move-btn ${move.special ? 'special-move' : ''}`}
                onClick={() => move.special ? setPendingMove(move) : handleMove(move)}
                disabled={turn !== 'player'}
              >
                <span className="move-copy">
                  <span>{move.special ? '✦ HABILIDAD ESPECIAL' : 'ATAQUE'}</span>
                  <strong>{move.name}</strong>
                </span>
                <strong className="move-power">{move.power}<small> POT.</small></strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {pendingMove && (
        <div className="ability-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPendingMove(null);
        }}>
          <section className={`ability-dialog type-${selectedCard?.type || 'normal'}`} role="dialog" aria-modal="true" aria-labelledby="ability-title">
            <button className="ability-close" onClick={() => setPendingMove(null)} aria-label="Cerrar">×</button>
            <p className="eyebrow">Habilidad especial · {selectedCard?.type}</p>
            <h2 id="ability-title">{pendingMove.name}</h2>
            <p className="ability-description">{pendingMove.description}</p>
            <div className="ability-details">
              <span>Potencia <strong>{pendingMove.power}</strong></span>
              <span>Pokémon <strong>{selectedCard?.name}</strong></span>
              <span>Objetivo <strong>{rivalCard?.name}</strong></span>
            </div>
            <div className="ability-actions">
              <button className="btn-secondary" onClick={() => setPendingMove(null)}>Ahora no</button>
              <button className="btn-action" onClick={() => handleMove(pendingMove)}>✦ Usar habilidad</button>
            </div>
          </section>
        </div>
      )}

      {roundOver && (
        <div className="battle-actions">
          {faintedIds.length < 5 ? (
            <button className="btn-action" onClick={nextRound}>Siguiente turno</button>
          ) : (
            <button className="btn-action" onClick={resetMatch}>Crear nuevo equipo</button>
          )}
        </div>
      )}

      {(battleLog.length > 0 || loading) && (
        <div className="battle-log">
          <div className="battle-log-header">Registro</div>
          {battleLog.map((entry, index) => (
            <div key={`${entry}-${index}`} className="log-entry">{entry}</div>
          ))}
          {loading && <div className="log-entry loading">Calculando resultados...</div>}
        </div>
      )}
    </div>
  );
}