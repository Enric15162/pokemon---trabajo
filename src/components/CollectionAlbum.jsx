import React from 'react';
import { Card } from './Card';
import { MASTER_POKEMON_IDS } from '../services/pokemonService';

export function CollectionAlbum({ collection }) {
  const ownedIds = new Set(collection.map(p => p.id));

  return (
    <div className="view-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'Outfit' }}>📖 Álbum Pokédex</h2>
        <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>
          Progreso: {MASTER_POKEMON_IDS.filter(id => ownedIds.has(id)).length} / {MASTER_POKEMON_IDS.length} Desbloqueados
        </div>
      </div>

      <div className="cards-grid">
        {MASTER_POKEMON_IDS.map(id => {
          const owned = collection.find(p => p.id === id);
          if (owned) {
            return <Card key={`owned-${id}`} pokemon={owned} />;
          }
          return <Card key={`missing-${id}`} pokemon={{ id }} isLocked={true} />;
        })}
      </div>
    </div>
  );
}