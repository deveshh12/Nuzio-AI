import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Waveform from './Waveform';

export default function Player() {
  const { current, playing, progress, toggle, next } = usePlayer();

  if (!current) return null;

  return (
    <aside className="player" aria-label="Now playing">
      <div className="player-top">
        <span>NOW NARRATING</span>
        <b>{current.headline}</b>
      </div>

      <Waveform active={playing} />

      <div
        className="timeline"
        aria-label={`${Math.round(progress)} percent complete`}
      >
        <i style={{ width: `${progress}%` }} />
      </div>

      <div className="controls">
        <button aria-label="Previous story" onClick={() => next(-1)}>
          <SkipBack size={17} />
        </button>
        <button
          className="big-play"
          aria-label={playing ? 'Pause narration' : 'Play narration'}
          onClick={toggle}
        >
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button aria-label="Next story" onClick={() => next(1)}>
          <SkipForward size={17} />
        </button>
        <em>1×</em>
      </div>
    </aside>
  );
}
