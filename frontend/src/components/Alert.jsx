export default function Alert({ type = 'error', children }) {
  return <div className={type === 'success' ? 'alert-success' : 'alert-error'}>{children}</div>;
}