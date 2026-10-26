import React from 'react';

export function Card({ pokemon, onClick, isLocked, isSelected, isUsed, compact = false }) {
  if (isLocked) {
    return (
      <div className="pokemon-card locked">
        <div className="card-img-wrapper">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Locked" />
        </div>
        <div className="pokemon-name muted">#{pokemon.id} ???</div>
        <div className="card-subtitle">Bloqueado</div>
      </div>
    );
  }

  if (!pokemon) return null;

  const type = pokemon.type || 'normal';
  const canSelect = Boolean(onClick) && !isUsed;
  const handleKeyDown = (event) => {
    if (canSelect && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(pokemon);
    }
  };

  return (
    <div
      className={`pokemon-card type-${type} ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''} ${compact ? 'compact' : ''}`}
      onClick={() => canSelect && onClick(pokemon)}
      onKeyDown={handleKeyDown}
      role={canSelect ? 'button' : undefined}
      tabIndex={canSelect ? 0 : undefined}
      aria-pressed={canSelect ? Boolean(isSelected) : undefined}
      aria-label={canSelect ? `Seleccionar ${pokemon.name}, tipo ${type}` : undefined}
    >
      <div className="card-topline">
        <span className={`type-badge ${type}`}>{type}</span>
        <span className="card-hp">PS <strong>{pokemon.hp}</strong></span>
        {isUsed && <span className="used-pill">Agotado</span>}
      </div>

      <div className="card-img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} loading="lazy" />
      </div>

      <div className="pokemon-name">{pokemon.name}</div>
      <div className="card-subtitle">Pokémon básico · #{String(pokemon.id).padStart(3, '0')}</div>

      <div className="stats-container">
        <div className="stat-row">
          <span>❤️ {pokemon.hp}</span>
          <span>⚔️ {pokemon.attack}</span>
        </div>
        <div className="stat-row">
          <span>🛡️ {pokemon.defense}</span>
          <span>⚡ {pokemon.speed}</span>
        </div>
        <div className="stat-row total">
          <span>Poder</span>
          <span>{pokemon.totalPower}</span>
        </div>
      </div>
    </div>
  );
}