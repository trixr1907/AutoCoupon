// Payback Coupon-Aktivator Bookmarklet
// Verwendung: Als Bookmark speichern mit dem Präfix "javascript:" vor dem Code

javascript:(function(){ 
    function activateCoupons() { 
        const couponCenter = document.querySelector("pb-coupon-center"); 
        
        if (couponCenter && couponCenter.shadowRoot) { 
            const coupons = couponCenter.shadowRoot.querySelectorAll("pbc-coupon"); 
            let activatedCount = 0; 
            
            coupons.forEach(coupon => { 
                if (coupon.shadowRoot) { 
                    const button = coupon.shadowRoot.querySelector("pbc-coupon-call-to-action"); 
                    
                    if (button && button.shadowRoot) { 
                        const aktivierenButton = button.shadowRoot.querySelector(".not-activated"); 
                        
                        if (aktivierenButton) { 
                            aktivierenButton.click(); 
                            activatedCount++; 
                        } 
                    } 
                } 
            }); 
            
            setTimeout(() => { 
                alert(`${activatedCount} Coupons wurden aktiviert.`); 
                
                if (confirm("Möchten Sie die Seite neu laden?")) { 
                    location.reload(); 
                } 
            }, 2000); 
        } else { 
            alert("Keine aktivierbaren Coupons gefunden. Möglicherweise sind alle Coupons bereits aktiviert oder die Seitenstruktur hat sich geändert."); 
        } 
    } 
    
    activateCoupons(); 
})();
