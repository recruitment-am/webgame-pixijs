import { Dispatch, createContext, useReducer } from 'react';
import { gameEvents } from './GameEvents';
import { logAs } from './systems/Logger';

export type GameActions = 'addScore' | 'takeLife';
export type GameState = { score: number; lives: number };
export type GameDispatch = Dispatch<GameAction>;

export const GameContext = createContext<{ state: GameState; dispatch: GameDispatch } | null>(null);
type GameAction = Record<string, unknown> & { type: GameActions };

export function GameProvider({
  children,
}: {
  children: React.ReactElement | React.ReactElement[];
}): JSX.Element {
  const query = new URLSearchParams(window.location.search);

  const [state, dispatch] = useReducer(gameStateReducer, {
    score: 0,
    lives: parseInt(query.get('lives') ?? '') || 3,
  });

  return (
    <>
      <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
    </>
  );
}

function gameStateReducer(state: GameState, action: GameAction) {
  let newState: GameState;
  switch (action.type) {
    case 'addScore':
      {
        const points = (action.points as number) ?? 1;
        logAs('gameReducer', 'Add score: ' + points);
        newState = {
          ...state,
          score: state.score + points,
        };
      }
      break;

    case 'takeLife':
      logAs('gameStateReducer', 'Life lost. Remaining: ' + (state.lives - 1));
      newState = {
        ...state,
        lives: state.lives - 1,
      };
      break;

    default:
      throw Error(`Unknown action ${action.type}`);
  }

  // the way to broadcast new state and actions to Phaser world
  gameEvents.emit(action.type, { action, oldState: state, state: newState });

  return newState;
}
