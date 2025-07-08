import React from 'react';
import './Table.css';
import { isNullOrEmpty } from '../../utils/DacUtil';

const Table = ({ headers, data }) => {
    console.log(data);
    
  return (
    <div className="custom-table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            {headers.map((head, idx) => (
              <th key={idx}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          { isNullOrEmpty(data) ? (
            <tr>
              <td colSpan={headers.length} className="no-data">No data available</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i}>
                {headers.map((head, j) => (
                  <td key={j}>{row[head]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
