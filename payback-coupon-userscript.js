// ==UserScript==
// @name         Payback Coupon Auto-Activator
// @namespace    https://github.com/trixr1907/Payback-Coupon
// @version      1.0
// @description  Automatically activate Payback coupons with a single click
// @author       trixr1907
// @match        *://*.payback.de/*
// @match        *://payback.de/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/trixr1907/Payback-Coupon/main/payback-coupon-userscript.js
// @downloadURL  https://raw.githubusercontent.com/trixr1907/Payback-Coupon/main/payback-coupon-userscript.js
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        ACTIVATION_DELAY: 500,
        FINAL_DELAY: 2000,
        BUTTON_TEXT: '🎯 Alle Coupons aktivieren',
        DEBUG: false
    };

    function log(message) {
        if (CONFIG.DEBUG) console.log('[Coupon Activator]', message);
    }

    function createActivateButton() {
        const button = document.createElement('button');
        button.textContent = CONFIG.BUTTON_TEXT;
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });

        button.addEventListener('click', activateCoupons);
        document.body.appendChild(button);
        return button;
    }

    function createProgressIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'coupon-progress';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0, 123, 255, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(indicator);
        return indicator;
    }

    function updateProgress(indicator, current, total) {
        if (indicator) {
            indicator.innerHTML = `
                <div>Aktiviere Coupons: ${current}/${total}</div>
                <div style="background: rgba(255,255,255,0.3); height: 4px; border-radius: 2px; margin-top: 5px;">
                    <div style="background: white; height: 100%; width: ${(current/total)*100}%; border-radius: 2px; transition: width 0.3s ease;"></div>
                </div>
            `;
        }
    }

    function removeProgress(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${colors[type]};
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            z-index: 10001;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            max-width: 400px;
            text-align: center;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    function activateCoupons() {
        let progressIndicator = null;
        
        try {
            log('Starting coupon activation...');
            
            const couponCenter = document.querySelector("pb-coupon-center");
            
            if (!couponCenter) {
                throw new Error("Coupon-Center nicht gefunden. Sind Sie auf der richtigen Seite?");
            }
            
            if (!couponCenter.shadowRoot) {
                throw new Error("Shadow DOM nicht verfügbar.");
            }

            const coupons = couponCenter.shadowRoot.querySelectorAll("pbc-coupon");
            
            if (coupons.length === 0) {
                throw new Error("Keine Coupons gefunden.");
            }

            log(`Found ${coupons.length} coupons`);
            
            progressIndicator = createProgressIndicator();
            let activatedCount = 0;
            let processedCount = 0;
            
            coupons.forEach((coupon, index) => {
                setTimeout(() => {
                    try {
                        if (coupon.shadowRoot) {
                            const button = coupon.shadowRoot.querySelector("pbc-coupon-call-to-action");
                            
                            if (button && button.shadowRoot) {
                                const aktivierenButton = button.shadowRoot.querySelector(".not-activated");
                                
                                if (aktivierenButton) {
                                    aktivierenButton.click();
                                    activatedCount++;
                                    log(`Activated coupon ${index + 1}`);
                                }
                            }
                        }
                    } catch (err) {
                        log(`Error activating coupon ${index + 1}: ${err.message}`);
                    }
                    
                    processedCount++;
                    updateProgress(progressIndicator, processedCount, coupons.length);
                    
                }, index * CONFIG.ACTIVATION_DELAY);
            });
            
            setTimeout(() => {
                removeProgress(progressIndicator);
                
                if (activatedCount > 0) {
                    showNotification(`✅ ${activatedCount} von ${coupons.length} Coupons erfolgreich aktiviert!`, 'success');
                } else {
                    showNotification(`ℹ️ Keine neuen Coupons aktiviert. Alle bereits aktiviert?`, 'info');
                }
                
            }, coupons.length * CONFIG.ACTIVATION_DELAY + CONFIG.FINAL_DELAY);
            
        } catch (error) {
            removeProgress(progressIndicator);
            showNotification(`❌ Fehler: ${error.message}`, 'error');
            log(`Error: ${error.message}`);
        }
    }

    // Wait for page to load and check if we're on a coupon page
    function initialize() {
        const checkForCoupons = () => {
            const couponCenter = document.querySelector("pb-coupon-center");
            if (couponCenter) {
                createActivateButton();
                log('Coupon activator button added');
            }
        };
        
        // Check immediately
        checkForCoupons();
        
        // Check again after a short delay (for SPAs)
        setTimeout(checkForCoupons, 2000);
        
        // Observe DOM changes for dynamic content
        const observer = new MutationObserver(() => {
            if (!document.querySelector('#coupon-activate-btn') && document.querySelector("pb-coupon-center")) {
                createActivateButton();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
