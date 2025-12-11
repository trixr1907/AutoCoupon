export const styles = `
  #payback-sota-widget {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: white;
    width: 360px;
    pointer-events: none; /* Container ignores clicks, children re-enable them */
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  #payback-sota-widget.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .sota-card {
    background: rgba(10, 10, 20, 0.95); /* bg */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(0, 243, 255, 0.2); /* border */
    border-radius: 16px;
    padding: 20px;
    box-shadow: 
      0 8px 32px 0 rgba(0, 0, 0, 0.5), /* card shadow */
      0 0 0 1px rgba(255, 255, 255, 0.05) inset; /* glass */
    pointer-events: auto;
    overflow: hidden;
    position: relative;
  }

  /* Glow effect */
  .sota-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .sota-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .sota-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }

  .sota-title-group {
    flex: 1;
  }

  .sota-title {
    font-weight: 600;
    font-size: 15px;
    color: #f8fafc;
    margin-bottom: 2px;
  }

  .sota-status {
    font-size: 13px;
    color: #94a3b8;
  }

  .sota-progress-container {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .sota-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #0ea5e9, #22d3ee);
    width: 0%;
    border-radius: 3px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
  }
  
  .sota-progress-bar.error {
    background: linear-gradient(90deg, #ef4444, #f87171);
    box-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
  }
  
  .sota-progress-bar.success {
    background: linear-gradient(90deg, #10b981, #34d399);
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
  }

  .sota-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    position: relative;
    z-index: 1;
  }

  .sota-stat-item {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .sota-stat-value {
    font-weight: 700;
    font-size: 16px;
    color: #f1f5f9;
  }
  
  .sota-stat-label {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }
`;
