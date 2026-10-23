import React, { useState } from 'react';
import { Table2, Search, Filter, Download, Info, CheckCircle2, Sparkles } from 'lucide-react';
import { AppStore } from '../services/store';

export const PayMatrixPage: React.FC = () => {
  const matrix = AppStore.getPayMatrix();
  const levels = Object.keys(matrix);
  const [searchPay, setSearchPay] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const parsedSearch = parseInt(searchPay.replace(/[^0-9]/g, ''), 10);

  // Find exact or nearest matches
  const matchingCells: { level: string; cellNumber: number; basicPay: number }[] = [];
  if (!isNaN(parsedSearch) && parsedSearch > 0) {
    levels.forEach(lvl => {
      matrix[lvl].forEach(cell => {
        if (cell.basicPay === parsedSearch) {
          matchingCells.push({ level: lvl, cellNumber: cell.cellNumber, basicPay: cell.basicPay });
        }
      });
    });
  }

  const maxCellsCount = Math.max(...levels.map(l => matrix[l].length));
  const cellRows = Array.from({ length: maxCellsCount }, (_, i) => i + 1);

  const displayedLevels = selectedLevel === 'ALL' ? levels : [selectedLevel];

  // GP Equivalents mapping for 7th CPC reference
  const gpMapping: Record<string, number> = {
    '1': 1800, '2': 1900, '3': 2000, '4': 2400, '5': 2800,
    '6': 4200, '7': 4600, '8': 4800, '9': 5400, '10': 5400,
    '11': 6600, '12': 7600, '13': 8700, '13A': 8900, '14': 10000,
    '15': 0, '16': 0, '17': 0, '18': 0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>Pay Matrix Table (Levels 1 to 18)</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Official Gazette Matrix for 7th Central Pay Commission with compounding annual 3% increments
          </p>
        </div>

        {/* Quick Search */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search amount (e.g. 56100)..."
              value={searchPay}
              onChange={(e) => setSearchPay(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="form-select"
            style={{ width: '160px' }}
          >
            <option value="ALL">Show All Levels</option>
            {levels.map(lvl => (
              <option key={lvl} value={lvl}>Level {lvl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Match Banner if searching */}
      {matchingCells.length > 0 && (
        <div className="card" style={{ backgroundColor: '#fefce8', borderColor: '#fef08a', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={18} color="#ca8a04" />
            <strong style={{ color: '#854d0e', fontSize: '0.92rem' }}>
              Search Match Found for ₹{parsedSearch.toLocaleString('en-IN')}:
            </strong>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {matchingCells.map((m, idx) => (
              <span key={idx} className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
                Level {m.level} — Index/Cell {m.cellNumber}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pay Matrix Grid */}
      <div className="matrix-container shadow-md">
        <table className="matrix-table">
          <thead>
            {/* Row 1: Level Numbers */}
            <tr>
              <th style={{ width: '60px', zIndex: 20 }}>Index</th>
              {displayedLevels.map(lvl => (
                <th key={lvl} className="level-header">
                  Level {lvl}
                </th>
              ))}
            </tr>
            {/* Row 2: Grade Pay Equivalents */}
            <tr>
              <th style={{ backgroundColor: '#334155', color: '#cbd5e1', fontSize: '0.75rem', zIndex: 20 }}>
                GP (6th)
              </th>
              {displayedLevels.map(lvl => (
                <th key={lvl} className="gp-header">
                  {gpMapping[lvl] ? `₹${gpMapping[lvl]}` : 'Apex / Cabinet'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cellRows.map(cellIdx => {
              // check if any level has this cell index
              const hasAnyData = displayedLevels.some(lvl => matrix[lvl].some(c => c.cellNumber === cellIdx));
              if (!hasAnyData) return null;

              return (
                <tr key={cellIdx}>
                  <td className="cell-idx">
                    {cellIdx}
                  </td>
                  {displayedLevels.map(lvl => {
                    const cell = matrix[lvl]?.find(c => c.cellNumber === cellIdx);
                    if (!cell) {
                      return <td key={lvl} style={{ backgroundColor: '#f8fafc', color: '#cbd5e1', textAlign: 'center' }}>—</td>;
                    }

                    const isMatch = parsedSearch === cell.basicPay;

                    return (
                      <td
                        key={lvl}
                        className={isMatch ? 'highlighted' : ''}
                        style={{
                          backgroundColor: isMatch ? '#fef08a' : (cellIdx % 2 === 0 ? '#f8fafc' : '#ffffff'),
                          cursor: 'pointer'
                        }}
                        title={`Level ${lvl}, Cell ${cell.cellNumber}: ₹${cell.basicPay.toLocaleString('en-IN')}`}
                      >
                        {cell.basicPay.toLocaleString('en-IN')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
