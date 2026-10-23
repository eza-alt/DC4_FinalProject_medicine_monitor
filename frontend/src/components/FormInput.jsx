
export default function FormInput({
  label,
  name,
  error,
  as = 'input',
  children,
  ...props
}) {
  const Field = as;

  return (
    <div className='form-group'>
      <label htmlFor={name}>{label}</label>

      <Field id={name} name={name} {...props}>
        {children}
      </Field>

      {error && <small className='field-error'>{error}</small>}
    </div>
  );
}
