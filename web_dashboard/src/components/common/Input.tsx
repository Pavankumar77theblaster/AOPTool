import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-text mb-2">
            {label}
            {props.required && <span className="text-danger-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input',
            error && 'border-danger-500 focus:ring-danger-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-400">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-dark-muted">{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
