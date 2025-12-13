/**
 * AutoCoupon - Overlay Styles
 * CSS für das Overlay Widget als String (für Injection in die Seite)
 */

export const overlayStyles = `
  #payback-sota-widget {
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 2147483647 !important;
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    color: white;
    width: 380px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  #payback-sota-widget.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .sota-card {
    background: #000000 !important;
    border: 3px solid #ffffff !important;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 10px 50px rgba(0,0,0,0.9);
    pointer-events: auto;
    overflow: hidden;
    position: relative;
    min-width: 380px;
  }

  .sota-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(56, 189, 248, 0.08) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .sota-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .sota-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }

  .sota-title-group {
    flex: 1;
  }

  .sota-title {
    font-weight: 700;
    font-size: 18px;
    color: #ffffff;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }

  .sota-status {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
  }

  .sota-progress-container {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .sota-progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #0ea5e9, #3b82f6);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .sota-progress-bar.success {
    background: linear-gradient(90deg, #22c55e, #16a34a);
  }

  .sota-progress-bar.error {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }

  .sota-toggle-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 16px;
    gap: 12px;
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.05);
    padding: 8px 12px;
    border-radius: 8px;
    position: relative;
    z-index: 10;
  }

  .sota-toggle-label {
    font-size: 14px;
    color: #ffffff;
    font-weight: 700;
  }

  .sota-toggle-label.active {
    color: #f59e0b;
    text-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
  }

  .sota-toggle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    pointer-events: auto;
  }

  .sota-toggle input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 20;
    cursor: pointer;
    margin: 0;
  }

  .sota-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.15);
    transition: .4s;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .sota-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 2px;
    background-color: #cbd5e1;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .sota-slider {
    background-color: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.8);
  }

  input:checked + .sota-slider:before {
    transform: translateX(16px);
    background-color: #f59e0b;
    box-shadow: 0 0 8px #f59e0b;
  }

  .sota-btn {
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    width: 100%;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    font-family: inherit;
    display: none;
    pointer-events: auto;
    position: relative;
    z-index: 10;
  }

  .sota-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
  }

  .sota-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
  }

  .sota-btn.visible {
    display: block;
    animation: fadeIn 0.3s ease;
  }

  .sota-stats-grid {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .sota-stat-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 10px 6px;
    border-radius: 8px;
    text-align: center;
    flex: 1;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .sota-stat-value {
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    display: block;
  }

  .sota-stat-label {
    font-size: 10px;
    color: #ffffff;
    text-transform: uppercase;
    font-weight: 700;
    margin-top: 2px;
    display: block;
  }

  .sota-disclaimer {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    line-height: 1.4;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
