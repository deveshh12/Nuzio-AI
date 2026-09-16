const bars = [8, 15, 25, 12, 9, 17, 29, 13, 22, 10, 16, 31, 12, 20, 9, 15, 23, 11, 35, 14, 10, 27, 18, 11, 23, 38, 19, 12];

export default function Waveform({ active = false }) {
  return (
    <div className={`wave ${active ? 'active' : ''}`}>
      {bars.map((h, i) => (
        <i key={i} style={{ height: h }} />
      ))}
    </div>
  );
}
