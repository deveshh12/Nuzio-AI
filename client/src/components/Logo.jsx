export default function Logo({ small = false }) {
  return (
    <div className={`logo ${small ? 'logo-small' : ''}`}>
      <span className="soundmark">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>
        Nuzio <b>AI</b>
      </span>
    </div>
  );
}
