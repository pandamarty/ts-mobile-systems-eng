
export const copyArray = (arr: any) => {
  return [...arr.map((rows: any) => [...rows])];
};

const maxGames = 100;
let minGames = 0;

export const getGameKey = (): string => {
  while(minGames < maxGames){
    minGames++;
    console.log("Game number: " + minGames);
    return `game-${minGames}`;
  }
  return 'game-overflow';
};
