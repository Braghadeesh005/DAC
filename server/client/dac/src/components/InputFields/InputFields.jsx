import React from 'react';
import './InputFields.css';

export const TextField = ({ value, onChange, placeholder }) => (
  <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="input-field" />
);

export const TextArea = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} className="input-field" />
);

export const RadioButton = ({ name, value, checked, onChange }) => (
  <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="radio-input" />
);

export const CheckBox = ({ checked, onChange }) => (
  <input type="checkbox" checked={checked} onChange={onChange} className="checkbox-input" />
);

export const DatePicker = ({ value, onChange }) => (
  <input type="date" value={value} onChange={onChange} className="input-field" />
);

export const TimePicker = ({ value, onChange }) => (
  <input type="time" value={value} onChange={onChange} className="input-field" />
);

export const SelectDropdown = ({ options = [], value, onChange }) => (
  <select value={value} onChange={onChange} className="input-field">
    {options.map((opt, idx) => (
      <option key={idx} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export const PasswordField = ({ value, onChange, placeholder }) => (
  <input type="password" value={value} onChange={onChange} placeholder={placeholder} className="input-field" />
);

export const NumberInput = ({ value, onChange, placeholder }) => (
  <input type="number" value={value} onChange={onChange} placeholder={placeholder} className="input-field" />
);

export const FileUpload = ({ onChange }) => (
  <input type="file" onChange={onChange} className="input-field" />
);

export const SwitchToggle = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="slider" />
  </label>
);
