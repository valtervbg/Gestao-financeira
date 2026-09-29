export default function Card({ label, value, icon, valueClass = '' }) {
  return (
    <div className="card flex flex-col justify-between">
      <div className="flex justify-between text-secondary">
        <span className="text-[11px] uppercase font-semibold tracking-wide">{label}</span>
        {icon && <span className="material-symbols-outlined">{icon}</span>}
      </div>
      <div className={`font-mono text-xl lg:text-2xl font-bold mt-2 ${valueClass}`}>{value}</div>
    </div>
  );
}
