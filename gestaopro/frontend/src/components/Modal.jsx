export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}
