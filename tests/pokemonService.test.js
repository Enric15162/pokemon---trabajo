import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeCollection, fetchUniquePokemonBatch } from '../src/services/pokemonService.js';

function mockPokemonPayload(id, name) {
  return {
    id,
    name,
    stats: [
      { stat: { name: 'hp' }, base_stat: 10 + id },
      { stat: { name: 'attack' }, base_stat: 20 + id },
      { stat: { name: 'defense' }, base_stat: 30 + id },
      { stat: { name: 'speed' }, base_stat: 40 + id }
    ],
    types: [{ type: { name: 'grass' } }],
    sprites: {
      other: {
        'official-artwork': { front_default: `https://example.com/${name}.png` },
      },
      front_default: `https://example.com/${name}.png`
    }
  };
}

test('sanitizeCollection elimina duplicados por id', () => {
  const collection = [
    { id: 1, name: 'bulbasaur', uniqueKey: 'a1' },
    { id: 2, name: 'charmander', uniqueKey: 'b2' },
    { id: 1, name: 'bulbasaur', uniqueKey: 'a2' },
    { id: 3, name: 'squirtle', uniqueKey: 'c3' }
  ];

  const result = sanitizeCollection(collection);

  assert.equal(result.length, 3);
  assert.deepEqual(result.map((p) => p.id).sort((a, b) => a - b), [1, 2, 3]);
});

test('fetchUniquePokemonBatch devuelve ids distintos sin repetidos', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const id = Number(url.split('/').at(-1));
    return {
      json: async () => mockPokemonPayload(id, `pokemon-${id}`)
    };
  };

  try {
    const result = await fetchUniquePokemonBatch(5, [1, 2, 3]);
    const ids = result.map((pokemon) => pokemon.id);

    assert.equal(ids.length, 5);
    assert.equal(new Set(ids).size, ids.length);
    ids.forEach((id) => assert.ok(![1, 2, 3].includes(id)));
  } finally {
    global.fetch = originalFetch;
  }
});
