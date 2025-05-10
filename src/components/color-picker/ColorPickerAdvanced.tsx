import React, { useState } from 'react'

const COLORS = [
  '#3a86ff',
  '#ff006e',
  '#8338ec',
  '#ffbe0b',
  '#06d6a0',
  '#ef476f',
  '#f0f2f5',
  '#20252e',
]

interface ColorPickerAdvancedProps {
  activeColor: string
  onColorSelect: (color: string) => void
}

const ColorPickerAdvanced: React.FC<ColorPickerAdvancedProps> = ({
  activeColor,
  onColorSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(isExpanded == null)
  }

  return (
    <div className="color-picker-advanced">
      <div className="color-picker-header" onClick={toggleExpand}>
        <div
          className="active-color"
          style={{
            backgroundColor: activeColor,
          }}
        />
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      {isExpanded && (
        <div className="color-grid">
          {COLORS.map(color => (
            <div
              key={color}
              className={`color-swatch ${color === activeColor ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ColorPickerAdvanced