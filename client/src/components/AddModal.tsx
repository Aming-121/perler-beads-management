import { useState } from 'react';

interface Props {
  onClose: () => void;
  onAdd: (series: string, number: number, quantity: number) => void;
}

const SERIES_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];

export default function AddModal({ onClose, onAdd }: Props) {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>('1');

  const handleSubmit = () => {
    if (selectedSeries && selectedNum && quantity) {
      onAdd(selectedSeries, selectedNum, parseInt(quantity));
      onClose();
    }
  };

  const isValid = selectedSeries && selectedNum && parseInt(quantity) > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">添加新豆号</h3>
        </div>
        <div className="modal-body">
          <div className="selector-group">
            <label className="selector-label">选择系列</label>
            <div className="selector-options">
              {SERIES_LIST.map(s => (
                <div
                  key={s}
                  className={`selector-option ${selectedSeries === s ? 'selected' : ''}`}
                  onClick={() => setSelectedSeries(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="selector-group">
            <label className="selector-label">选择序号</label>
            <div className="selector-options">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(n => (
                <div
                  key={n}
                  className={`selector-option ${selectedNum === n ? 'selected' : ''}`}
                  onClick={() => setSelectedNum(n)}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          <div className="selector-group">
            <label className="selector-label">数量</label>
            <input
              type="number"
              className="number-input"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min="1"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.5 }}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}
