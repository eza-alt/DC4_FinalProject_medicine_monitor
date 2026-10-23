
import Modal from './Modal';

export default function ConfirmDialog({
  title = 'Please confirm',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>

      <div className='modal-actions'>
        <button
          className='btn'
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          className={danger ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
