import { useState } from 'react';

interface Props {
  item: { series: string; number: number; quantity: number };
  onClose: () => void;
  onAdd: () => void;
  onSubtract: () => void;
  onCustom: (delta: number) => void;
}

export default function OperationModal({ item, onClose, onAdd, onSubtract, onCustom }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customType, setCustomType] = useState<'add' | 'sub'>('add');

  const handleCustomSubmit = () => {
    const value = parseInt(customValue);
    if (value > 0) {
      onCustom(customType === 'add' ? value : -value);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{item.series}{item.number}</h3>
        </div>
        <div className="modal-body">
          <div className="qty-display">
            <div className="qty-label">当前库存</div>
            <div className="qty-value">{item.quantity}</div>
            <div className="qty-name">{item.series} 系列 · 序号 {item.number}</div>
          </div>

          {!showCustom ? (
            <>
              <div className="action-buttons">
                <button className="action-btn action-btn-add" onClick={onAdd}>
                  <svg className="action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  加1
                </button>
                <button className="action-btn action-btn-sub" onClick={onSubtract}>
                  <svg className="action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  减1
                </button>
                <button className="action-btn action-btn-custom" onClick={() => setShowCustom(true)}>
                  <svg className="action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  自定义
                </button>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
                关闭
              </button>
            </>
          ) : (
            <>
              <div className="selector-group">
                <label className="selector-label">操作类型</label>
                <div className="selector-options">
                  <div
                    className={`selector-option ${customType === 'add' ? 'selected' : ''}`}
                    onClick={() => setCustomType('add')}
                    style={{ minWidth: '80px', flex: 1 }}
                  >
                    增加
                  </div>
                  <div
                    className={`selector-option ${customType === 'sub' ? 'selected' : ''}`}
                    onClick={() => setCustomType('sub')}
                    style={{ minWidth: '80px', flex: 1 }}
                  >
                    减少
                  </div>
                </div>
              </div>
              <div className="selector-group">
                <label className="selector-label">输入数量</label>
                <input
                  type="number"
                  className="number-input"
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  min="1"
                  placeholder="请输入数量"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCustom(false)}>
                  返回
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCustomSubmit}
                  disabled={!customValue || parseInt(customValue) <= 0}
                  style={{ opacity: customValue && parseInt(customValue) > 0 ? 1 : 0.5 }}
                >
                  确认
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
