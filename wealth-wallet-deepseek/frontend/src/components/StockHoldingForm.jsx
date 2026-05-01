import { useState, useEffect } from 'react';

function StockHoldingForm({ holding, onSubmit, onCancel }) {
  const [stockCode, setStockCode] = useState('');
  const [stockName, setStockName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  useEffect(() => {
    if (holding) {
      setStockCode(holding.stock_code || '');
      setStockName(holding.stock_name || '');
      setQuantity(holding.quantity?.toString() || '');
      setCostPrice(holding.cost_price?.toString() || '');
      setCurrentPrice(holding.current_price?.toString() || '');
    }
  }, [holding]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      stock_code: stockCode,
      stock_name: stockName,
      quantity: parseFloat(quantity),
      cost_price: parseFloat(costPrice),
      current_price: parseFloat(currentPrice),
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{holding ? 'Edit Stock Holding' : 'Add Stock Holding'}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Stock Code</label>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              placeholder="e.g. AAPL"
              required
            />
          </div>
          <div className="form-group">
            <label>Stock Name</label>
            <input
              type="text"
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              placeholder="e.g. Apple Inc."
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Cost Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label>Current Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {holding ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockHoldingForm;
