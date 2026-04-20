export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  as: Tag = 'input',
  children,
  ...rest
}) {
  return (
    <div className="field-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      {Tag === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`input ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          required={required}
          {...rest}
        >
          {children}
        </select>
      ) : Tag === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input min-h-[120px] resize-vertical ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          required={required}
          {...rest}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          required={required}
          {...rest}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
