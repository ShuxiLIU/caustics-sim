import React, { useState, useRef, useEffect } from 'react'

type RangeInputProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export function RangeInput({ label, value, min, max, step, onChange, formatValue = (v) => v.toString() }: RangeInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(formatValue(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditing) {
      setInputValue(formatValue(value))
    }
  }, [value, formatValue, isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    let newValue = parseFloat(inputValue)
    if (isNaN(newValue)) {
      newValue = value
    }
    newValue = Math.max(min, Math.min(max, newValue))
    onChange(newValue)
    setIsEditing(false)
  }

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    } else if (e.key === 'Escape') {
      setInputValue(formatValue(value))
      setIsEditing(false)
    }
  }

  const handleValueClick = () => {
    setIsEditing(true)
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  return (
    <label className="field">
      <div className="field-row">
        <span>{label}</span>
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleInputKeyPress}
            style={{
              width: '60px',
              textAlign: 'right',
              background: 'rgba(10, 22, 38, 0.76)',
              border: '1px solid rgba(136, 191, 243, 0.18)',
              borderRadius: '8px',
              color: '#ecf6ff',
              padding: '2px 6px',
              fontSize: '14px'
            }}
          />
        ) : (
          <strong onClick={handleValueClick} style={{ cursor: 'pointer' }}>
            {formatValue(value)}
          </strong>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}