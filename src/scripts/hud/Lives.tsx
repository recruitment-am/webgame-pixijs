import { useGame } from '../game/useGame';
import './hud.css';

export default function Lives(): JSX.Element {
  const { state } = useGame();

  return (
    <div id="Lives" className="relativeWrapper">
      <div>{new Array(state.lives).fill('').map(() => '❤️')}</div>
    </div>
  );
}
