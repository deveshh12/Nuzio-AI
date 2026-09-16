import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [queue, setQueueState] = useState([]);
  const [briefComplete, setBriefComplete] = useState(false);
  const [narrationError, setNarrationError] = useState('');

  const timer = useRef();
  const utterance = useRef(null);
  const queueRef = useRef([]);
  const currentRef = useRef(null);
  const keepAlive = useRef(null); // Chrome 15-second bug workaround
  const voices = useRef([]);

  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Keep refs in sync
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => {
    if (!supported) return undefined;
    const loadVoices = () => { voices.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [supported]);

  const stopProgress = () => clearInterval(timer.current);

  const startProgress = () => {
    stopProgress();
    timer.current = setInterval(
      () => setProgress((v) => Math.min(96, v + 1)),
      750
    );
  };

  /**
   * Chrome pauses SpeechSynthesis after ~15 seconds of continuous speech.
   * Workaround: periodically pause/resume to reset Chrome's internal timer.
   */
  const startKeepAlive = () => {
    clearInterval(keepAlive.current);
    keepAlive.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10_000);
  };

  const stopKeepAlive = () => clearInterval(keepAlive.current);

  const reset = () => {
    if (supported) window.speechSynthesis.cancel();
    stopProgress();
    stopKeepAlive();
    utterance.current = null;
    setCurrent(null);
    setPlaying(false);
    setProgress(0);
    setBriefComplete(false);
    setNarrationError('');
  };

  const speak = (article) => {
    if (!article) return;
    if (!supported) {
      setNarrationError('Audio narration is not supported in this browser. Try Chrome, Safari, or Edge.');
      return;
    }

    // Cancel any existing speech
    const synth = window.speechSynthesis;
    synth.resume();
    if (synth.speaking || synth.pending || synth.paused) {
      synth.cancel();
    }

    stopProgress();
    stopKeepAlive();
    setCurrent(article);
    setProgress(0);
    setBriefComplete(false);
    setNarrationError('');

    const voice = new SpeechSynthesisUtterance(
      `${article.headline}. ${article.summary}`
    );
    utterance.current = voice;
    voice.rate = 0.96;
    voice.pitch = 1;
    voice.voice = voices.current.find((item) => item.lang === 'en-IN')
      || voices.current.find((item) => item.lang.startsWith('en-'))
      || null;

    voice.onstart = () => {
      if (utterance.current !== voice) return;
      setPlaying(true);
      startProgress();
      startKeepAlive();
    };

    voice.onpause = () => {
      if (utterance.current !== voice) return;
      setPlaying(false);
      stopProgress();
      stopKeepAlive();
    };

    voice.onresume = () => {
      if (utterance.current !== voice) return;
      setPlaying(true);
      startProgress();
      startKeepAlive();
    };

    voice.onend = () => {
      if (utterance.current !== voice) return;
      setPlaying(false);
      stopProgress();
      stopKeepAlive();

      // Auto-advance to next article in queue
      const items = queueRef.current;
      const index = items.findIndex((item) => item._id === article._id);
      if (index > -1 && index < items.length - 1) {
        speak(items[index + 1]);
      } else {
        setProgress(100);
        setBriefComplete(true);
      }
    };

    voice.onerror = () => {
      if (utterance.current !== voice) return;
      setPlaying(false);
      stopProgress();
      stopKeepAlive();
      setNarrationError('Narration could not start. Check your device sound and try Play again.');
    };

    synth.speak(voice);
    synth.resume();
  };

  const toggle = () => {
    if (!current || !supported) return;

    if (playing) {
      window.speechSynthesis.pause();
      stopProgress();
      stopKeepAlive();
      setPlaying(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      startProgress();
      startKeepAlive();
    } else {
      speak(current);
    }
  };

  const next = (direction) => {
    const items = queueRef.current;
    if (!items.length) return;
    const index = Math.max(
      0,
      items.findIndex((item) => item._id === currentRef.current?._id)
    );
    speak(items[(index + direction + items.length) % items.length]);
  };

  const setQueue = useCallback((items) => {
    queueRef.current = items;
    setQueueState(items);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
      stopProgress();
      stopKeepAlive();
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        current,
        playing,
        progress,
        briefComplete,
        narrationError,
        supported,
        speak,
        toggle,
        next,
        reset,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
