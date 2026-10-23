
export default function Modal({ title, onClose, children }) {
  return (
    <div className='modal-backdrop' onClick={onClose}>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-head'>
          <h2>{title}</h2>
          <button
            className='icon-btn'
            onClick={onClose}
            aria-label='Close'
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
