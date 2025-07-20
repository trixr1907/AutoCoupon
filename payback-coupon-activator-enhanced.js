// Payback Coupon-Aktivator Bookmarklet (Enhanced Version)
// Verwendung: Als Bookmark speichern mit dem Präfix "javascript:" vor dem Code

javascript:(function(){ 
    const CONFIG = {
        ACTIVATION_DELAY: 500,      // Delay between coupon activations (ms)
        FINAL_DELAY: 2000,         // Delay before showing results (ms)
        MAX_RETRIES: 3,            // Maximum retry attempts
        DEBUG: false               // Enable debug logging
    };

    function log(message) {
        if (CONFIG.DEBUG) console.log('[Coupon Activator]', message);
    }

    function createProgressIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'coupon-progress';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(indicator);
        return indicator;
    }

    function updateProgress(indicator, current, total) {
        if (indicator) {
            indicator.textContent = `Aktiviere Coupons: ${current}/${total}`;
        }
    }

    function removeProgress(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
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
                throw new Error("Shadow DOM nicht verfügbar. Die Seitenstruktur könnte sich geändert haben.");
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
                
                const message = activatedCount > 0 
                    ? `✅ ${activatedCount} von ${coupons.length} Coupons wurden erfolgreich aktiviert!`
                    : `ℹ️ Keine neuen Coupons aktiviert. Möglicherweise sind bereits alle aktiviert.`;
                
                alert(message);
                
                if (activatedCount > 0 && confirm("Möchten Sie die Seite neu laden, um die Änderungen zu sehen?")) { 
                    location.reload(); 
                } 
            }, coupons.length * CONFIG.ACTIVATION_DELAY + CONFIG.FINAL_DELAY);
            
        } catch (error) {
            removeProgress(progressIndicator);
            alert(`❌ Fehler: ${error.message}\n\nTipps:\n- Stellen Sie sicher, dass Sie auf der Coupon-Seite sind\n- Versuchen Sie, die Seite zu aktualisieren\n- Prüfen Sie, ob alle Coupons bereits aktiviert sind`);
            log(`Error: ${error.message}`);
        }
    } 
    
    activateCoupons(); 
})();
