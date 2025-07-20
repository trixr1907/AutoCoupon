// Payback Coupon-Aktivator Bookmarklet - Enhanced mit Ladebalken
// Verwendung: Als Bookmark speichern mit dem Präfix "javascript:" vor dem Code

javascript:(function(){
  var statusWidget;
  var progressBar;
  var startTime = new Date();
  
  // Erweiterte Status-Anzeige mit Ladebalken erstellen
  function createStatusWidget() {
    // Entferne alte Instanz
    var oldWidget = document.getElementById('payback-widget');
    if (oldWidget) oldWidget.remove();
    
    statusWidget = document.createElement('div');
    statusWidget.id = 'payback-widget';
    statusWidget.style.cssText = '
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 99999;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      min-width: 320px;
      max-width: 380px;
      transition: all 0.3s ease;
    ';
    
    statusWidget.innerHTML = '
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 18px;">🎯</div>
        <div>
          <div style="font-weight: bold; font-size: 16px;">Payback Coupon-Klicker</div>
          <div id="widget-status" style="font-size: 12px; opacity: 0.9;">Wird gestartet...</div>
        </div>
      </div>
      <div id="widget-progress" style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 8px; margin: 10px 0; overflow: hidden;">
        <div id="progress-bar" style="height: 100%; background: linear-gradient(90deg, #00d4aa, #00b4db); width: 0%; transition: width 0.3s ease;"></div>
      </div>
      <div id="widget-details" style="font-size: 12px; opacity: 0.8; line-height: 1.4;">Initialisierung...</div>
    ';
    
    document.body.appendChild(statusWidget);
    progressBar = statusWidget.querySelector('#progress-bar');
    return statusWidget;
  }
  
  function updateWidget(status, details, progress, isError) {
    if (!statusWidget) return;
    
    var statusEl = statusWidget.querySelector('#widget-status');
    var detailsEl = statusWidget.querySelector('#widget-details');
    
    if (statusEl) statusEl.textContent = status;
    if (detailsEl) detailsEl.innerHTML = details;
    
    if (progressBar && progress !== undefined) {
      progressBar.style.width = progress + '%';
      if (isError) {
        progressBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ee5a52)';
      }
    }
    
    if (isError) {
      statusWidget.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    }
  }
  
  function removeWidget(delay) {
    setTimeout(function() {
      if (statusWidget) {
        statusWidget.style.opacity = '0';
        statusWidget.style.transform = 'translateX(100%)';
        setTimeout(function() {
          if (statusWidget && statusWidget.parentNode) {
            statusWidget.parentNode.removeChild(statusWidget);
          }
        }, 300);
      }
    }, delay || 5000);
  }
  
  function formatTime(ms) {
    return (ms / 1000).toFixed(1) + 's';
  }
  
  function activateCoupons() {
    try {
      createStatusWidget();
      updateWidget('🔍 Analysiere Seite...', 'Suche nach Coupon-Elementen', 10);
      
      setTimeout(function() {
        var couponCenter = document.querySelector('pb-coupon-center');
        
        if (!couponCenter) {
          updateWidget('❌ Fehler', 'Keine Payback-Coupon-Seite gefunden.<br>Stellen Sie sicher, dass Sie auf payback.de sind.', 100, true);
          removeWidget();
          return;
        }
        
        updateWidget('🔍 Prüfe Struktur...', 'Shadow DOM wird analysiert', 20);
        
        setTimeout(function() {
          if (!couponCenter.shadowRoot) {
            updateWidget('❌ Fehler', 'Shadow DOM nicht verfügbar.<br>Die Seitenstruktur könnte sich geändert haben.', 100, true);
            removeWidget();
            return;
          }
          
          var coupons = couponCenter.shadowRoot.querySelectorAll('pbc-coupon');
          
          if (coupons.length === 0) {
            updateWidget('ℹ️ Keine Coupons', 'Keine aktivierbaren Coupons gefunden.<br>Möglicherweise sind alle bereits aktiviert.', 100);
            removeWidget();
            return;
          }
          
          updateWidget('📊 Gefunden: ' + coupons.length + ' Coupons', 'Beginne mit der Aktivierung...', 30);
          
          var activatedCount = 0;
          var skippedCount = 0;
          var processedCount = 0;
          
          for (var i = 0; i < coupons.length; i++) {
            (function(coupon, index) {
              setTimeout(function() {
                var currentProgress = 30 + (index / coupons.length) * 60;
                updateWidget('⚡ Aktiviere Coupon ' + (index + 1) + '/' + coupons.length, 
                           'Verarbeite Coupon ' + (index + 1) + '...<br>Aktiviert: ' + activatedCount + ' | Übersprungen: ' + skippedCount, 
                           currentProgress);
                
                try {
                  if (coupon.shadowRoot) {
                    var button = coupon.shadowRoot.querySelector('pbc-coupon-call-to-action');
                    
                    if (button && button.shadowRoot) {
                      var aktivierenButton = button.shadowRoot.querySelector('.not-activated');
                      
                      if (aktivierenButton) {
                        aktivierenButton.click();
                        activatedCount++;
                        console.log('✅ Coupon ' + (index + 1) + ' erfolgreich aktiviert');
                        
                        // Visuelles Feedback bei erfolgreicher Aktivierung
                        updateWidget('✅ Coupon ' + (index + 1) + ' aktiviert!', 
                                   'Aktiviert: ' + activatedCount + ' | Übersprungen: ' + skippedCount + ' | Verbleibend: ' + (coupons.length - index - 1), 
                                   currentProgress);
                      } else {
                        skippedCount++;
                        console.log('⏭️ Coupon ' + (index + 1) + ' bereits aktiviert');
                      }
                    } else {
                      skippedCount++;
                    }
                  } else {
                    skippedCount++;
                  }
                } catch (e) {
                  skippedCount++;
                  console.warn('⚠️ Fehler bei Coupon ' + (index + 1) + ':', e);
                }
                
                processedCount++;
                
                // Nach dem letzten Coupon Endergebnis anzeigen
                if (processedCount === coupons.length) {
                  setTimeout(function() {
                    var endTime = new Date();
                    var duration = endTime - startTime;
                    
                    if (activatedCount > 0) {
                      updateWidget('🎉 Erfolgreich abgeschlossen!', 
                                 '✅ ' + activatedCount + ' Coupons aktiviert<br>' +
                                 '⏭️ ' + skippedCount + ' bereits aktiviert<br>' +
                                 '⏱️ Dauer: ' + formatTime(duration) + '<br>' +
                                 '💰 Bereit zum Sparen!', 100);
                      
                      setTimeout(function() {
                        if (window.confirm('🔄 Seite neu laden um Änderungen zu sehen?')) {
                          location.reload();
                        } else {
                          removeWidget(3000);
                        }
                      }, 2500);
                    } else {
                      updateWidget('ℹ️ Vorgang abgeschlossen', 
                                 'Keine neuen Coupons aktiviert<br>' +
                                 '⏭️ ' + skippedCount + ' bereits aktiviert<br>' +
                                 '⏱️ Dauer: ' + formatTime(duration), 100);
                      removeWidget();
                    }
                  }, 800);
                }
              }, index * 400); // 400ms Verzögerung für bessere Visualisierung
            })(coupons[i], i);
          }
        }, 500);
      }, 300);
      
    } catch (error) {
      console.error('Bookmarklet Fehler:', error);
      updateWidget('❌ Unerwarteter Fehler', 'Fehlerdetails: ' + error.message + '<br>Prüfen Sie die Konsole für weitere Informationen.', 100, true);
      removeWidget();
    }
  }
  
  activateCoupons();
});
