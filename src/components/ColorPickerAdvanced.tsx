import React, { useState } from 'react';

interface ColorPickerAdvancedProps {
  activeColor: string;
  onColorSelect: (color: string) => void;
}

const DEFAULT_COLORS = [
  '#3a86ff', // primary blue
  '#ff006e', // accent pink
  '#8338ec', // purple
  '#ffbe0b', // yellow
  '#06d6a0', // green
  '#ef476f', // red
  '#f0f2f5', // white
  '#20252e', // black
];

const ColorPickerAdvanced: React.FC<ColorPickerAdvancedProps> = ({ 
  activeColor, 
  onColorSelect
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [opacity, setOpacity] = useState(100);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHue(parseInt(e.target.value, 10));
    updateCustomColor();
  };
  
  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaturation(parseInt(e.target.value, 10));
    updateCustomColor();
  };
  
  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLightness(parseInt(e.target.value, 10));
    updateCustomColor();
  };
  
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpacity(parseInt(e.target.value, 10));
    updateCustomColor();
  };
  
  const updateCustomColor = () => {
    const color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity / 100})`;
    onColorSelect(color);
  };
  
  return (
    <div className="color-picker-container">
      <div className="color-picker">
        {DEFAULT_COLORS.map((color) => (
          <div
            key={color}
            className={`color-swatch ${activeColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
          />
        ))}
        <div 
          className={`color-swatch custom-color ${isExpanded ? 'expanded' : ''}`}
          style={{ backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity / 100})` }}
          onClick={toggleExpand}
        />
      </div>
      
      {isExpanded && (
        <div className="color-picker-advanced">
          <div className="color-slider-group">
            <label>
              <span>Hue</span>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={hue} 
                onChange={handleHueChange}
                className="color-slider hue-slider" 
              />
            </label>
          </div>
          
          <div className="color-slider-group">
            <label>
              <span>Saturation</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={saturation} 
                onChange={handleSaturationChange}
                className="color-slider saturation-slider" 
              />
            </label>
          </div>
          
          <div className="color-slider-group">
            <label>
              <span>Lightness</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={lightness} 
                onChange={handleLightnessChange}
                className="color-slider lightness-slider" 
              />
            </label>
          </div>
          
          <div className="color-slider-group">
            <label>
              <span>Opacity</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={opacity} 
                onChange={handleOpacityChange}
                className="color-slider opacity-slider" 
              />
            </label>
          </div>
          
          <div className="color-preview" style={{ 
            backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity / 100})`
          }} />
        </div>
      )}
    </div>
  );
};

export default ColorPickerAdvanced;