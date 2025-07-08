import React from 'react';
import './Forms.css';
import Button from '../components/button/Button';

const Forms = ({ labelList = [], maxComponentsPerColumn = 4, onSubmit, children }) => {
  const childrenArray = React.Children.toArray(children);

  const rows = [...childrenArray];

  const hasSubmitButton = childrenArray.some(
    (child) => child?.props?.type === 'submit'
  );

  if (!hasSubmitButton) {
    rows.push(
      <Button type="submit" bgColor={'var(--font-grey)'} textColor={'var(--font-primary)'}  key="auto-submit">
        Submit
      </Button>
    );
    labelList.push('');
  }

  const columns = [];
  for (let i = 0; i < rows.length; i += maxComponentsPerColumn) {
    columns.push(rows.slice(i, i + maxComponentsPerColumn));
  }

  return (
    <form className="form-wrapper" onSubmit={onSubmit}>
      <div className="form-container">
        {columns.map((col, colIndex) => (
          <div className="form-column" key={colIndex}>
            {col.map((component, index) => {
              const label = labelList[colIndex * maxComponentsPerColumn + index] || '';
              return (
                <div className="form-row" key={index}>
                  <label className="form-label">{label}</label>
                  <div className="form-field">{component}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </form>
  );
};

export default Forms;
