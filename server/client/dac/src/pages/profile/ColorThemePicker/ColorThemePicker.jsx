import React, { useEffect, useState } from 'react';
import './ColorThemePicker.css';
import MainLayout from '../../../layouts/MainLayout';

const colorThemes = [
  { name: 'White', value: 'rgb(255, 255, 255)' },
  { name: 'Purple', value: '#824be7' },
  { name: 'Green', value: '#1cc045' },
  { name: 'Cyan Blue', value: '#2bc3e9' },
  { name: 'Red', value: '#d4414d' },
  { name: 'Orange', value: '#d89821' },
  { name: 'Yellow', value: '#eedf13' },
];

const ColorThemePicker = () => {
  const [selectedColor, setSelectedColor] = useState(localStorage.getItem('theme-color') || '#824be7'); // Default

  const applyThemeColor = (colorValue) => {
    document.documentElement.style.setProperty('--font-primary', colorValue);
    setSelectedColor(colorValue);
  };

  useEffect(() => {
    applyThemeColor(selectedColor);
  }, [selectedColor]);

  const handleThemeChange = (colorValue) => {
    applyThemeColor(colorValue);
    localStorage.setItem('theme-color', colorValue);
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme-color') {
        const newColor = e.newValue;
        if (newColor) applyThemeColor(newColor);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <MainLayout>
      <div className="color-theme-picker-outer">
        <div className="color-theme-picker">
          <div className="color-buttons">
            <h4>Selected</h4>
            <div
              className="color-primary"
              style={{ backgroundColor: selectedColor }}
            ></div>
          </div>
          <div className="color-theme-picker-inner">
            <h4>Select Theme Color</h4>
            <div className="color-buttons">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  className="color-btn"
                  style={{ backgroundColor: theme.value }}
                  onClick={() => handleThemeChange(theme.value)}
                  title={theme.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ColorThemePicker;
