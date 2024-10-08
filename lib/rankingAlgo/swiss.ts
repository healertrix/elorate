import { Card } from '../../lib/rankingAlgo/glicko';

export function getNextPair(
  cards: Card[],
  round: number,
  pairingHistory: { [key: number]: Set<number> }
): [Card, Card] | null {
  const sortedCards = [...cards].sort((a, b) => {
    if (a.glickoRating !== b.glickoRating) {
      return b.glickoRating - a.glickoRating;
    }
    return b.sonnebornBerger - a.sonnebornBerger;
  });

  // Shuffle the sorted cards to introduce more randomness
  const shuffledCards = sortedCards.sort(() => Math.random() - 0.5);

  // Try to pair cards that haven't played each other yet
  for (let i = 0; i < shuffledCards.length; i++) {
    for (let j = i + 1; j < shuffledCards.length; j++) {
      const card1 = shuffledCards[i];
      const card2 = shuffledCards[j];

      if (!hasPaired(card1.id, card2.id, pairingHistory)) {
        return [card1, card2];
      }
    }
  }

  // If all pairs have played, find the pair with the least number of matches
  let leastMatches = Infinity;
  let bestPair: [Card, Card] | null = null;

  for (let i = 0; i < shuffledCards.length - 1; i++) {
    for (let j = i + 1; j < shuffledCards.length; j++) {
      const card1 = shuffledCards[i];
      const card2 = shuffledCards[j];
      const matches =
        (pairingHistory[card1.id]?.size || 0) +
        (pairingHistory[card2.id]?.size || 0);

      if (matches < leastMatches) {
        leastMatches = matches;
        bestPair = [card1, card2];
      }
    }
  }

  return bestPair;
}

function hasPaired(
  id1: number,
  id2: number,
  pairingHistory: { [key: number]: Set<number> }
): boolean {
  return (
    (pairingHistory[id1]?.has(id2) || pairingHistory[id2]?.has(id1)) ?? false
  );
}

export function getTotalRounds(numCards: number): number {
  if (numCards <= 15) {
    return numCards - 1; // Round-robin for small sets
  } else {
    return Math.ceil(Math.log2(numCards)) + 3; // Original logic for larger sets
  }
}

export function calculateSonnebornBerger(
  card: Card,
  allCards: Card[],
  results: Array<{ winner: number; loser: number }>
): number {
  let score = 0;
  for (const result of results) {
    if (result.winner === card.id) {
      const opponent = allCards.find((c) => c.id === result.loser);
      if (opponent) {
        score += opponent.glickoRating;
      }
    } else if (result.loser === card.id) {
      const opponent = allCards.find((c) => c.id === result.winner);
      if (opponent) {
        score += opponent.glickoRating / 2;
      }
    }
  }
  return score;
}
