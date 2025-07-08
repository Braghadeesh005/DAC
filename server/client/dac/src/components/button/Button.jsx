import React from 'react';
import './Button.css';

const Button = ({ children, bgColor, textColor, ...rest }) => {
  const style = {
    backgroundColor: bgColor || 'var(--bg-light-grey)',
    color: textColor || 'var(--font-primary)',
  };

  return (
    <button className="custom-button" style={style} {...rest}>
      {children}
    </button>
  );
};

export default Button;
