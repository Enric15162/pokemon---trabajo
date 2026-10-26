export function getRemainingTeam(team = [], faintedIds = []) {
  return team.filter((pokemon) => !faintedIds.includes(pokemon.id));
}

export function evaluateBattleState({ playerTeam = [], rivalTeam = [], playerFaintedIds = [], rivalFaintedIds = [] }) {
  const playerAlive = getRemainingTeam(playerTeam, playerFaintedIds);
  const rivalAlive = getRemainingTeam(rivalTeam, rivalFaintedIds);

  if (rivalAlive.length === 0 && rivalTeam.length > 0) {
    return {
      winner: 'player',
      matchComplete: true,
      shouldChargeEntry: true,
      playerAlive: playerAlive.length,
      rivalAlive: rivalAlive.length,
      reason: 'Has eliminado a los 5 Pokémon rivales.'
    };
  }

  if (playerAlive.length === 0 && playerTeam.length > 0) {
    return {
      winner: 'rival',
      matchComplete: true,
      shouldChargeEntry: false,
      playerAlive: playerAlive.length,
      rivalAlive: rivalAlive.length,
      reason: 'El rival ha eliminado a tu equipo.'
    };
  }

  return {
    winner: null,
    matchComplete: false,
    shouldChargeEntry: false,
    playerAlive: playerAlive.length,
    rivalAlive: rivalAlive.length,
    reason: 'La partida sigue activa.'
  };
}
