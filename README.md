# **Payback Coupon-Klicker** 🎯

## **1. Was ist das?**

Dieses Tool klickt automatisch alle deine Payback-Coupons an, damit du sie nicht einzeln sammeln musst. Es spart dir Zeit und sorgt dafür, dass du keinen Coupon vergisst.

## **2. Installation in 3 Schritten**

### **Schritt 1:** Code aus Kästchen kopieren

![Screenshot Schritt 1](docs/images/step1_placeholder.png)
```javascript
javascript:(function(){var w,p,s=new Date();function create(){var o=document.getElementById('payback-widget');o&&o.remove();w=document.createElement('div');w.id='payback-widget';w.style.cssText='position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;z-index:99999;box-shadow:0 8px 32px rgba(31,38,135,0.37);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.18);min-width:320px;max-width:380px;transition:all 0.3s ease;';w.innerHTML='<div style="display:flex;align-items:center;margin-bottom:15px;"><div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;font-size:18px;">🎯</div><div><div style="font-weight:bold;font-size:16px;">Payback Coupon-Klicker</div><div id="widget-status" style="font-size:12px;opacity:0.9;">Wird gestartet...</div></div></div><div style="background:rgba(255,255,255,0.2);border-radius:10px;height:8px;margin:10px 0;overflow:hidden;"><div id="progress-bar" style="height:100%;background:linear-gradient(90deg,#00d4aa,#00b4db);width:0%;transition:width 0.3s ease;"></div></div><div id="widget-details" style="font-size:12px;opacity:0.8;line-height:1.4;">Initialisierung...</div>';document.body.appendChild(w);p=w.querySelector('#progress-bar');}function update(status,details,progress,isError){if(!w)return;var st=w.querySelector('#widget-status'),dt=w.querySelector('#widget-details');if(st)st.textContent=status;if(dt)dt.innerHTML=details;if(p&&progress!==undefined){p.style.width=progress+'%';if(isError)p.style.background='linear-gradient(90deg,#ff6b6b,#ee5a52)';}if(isError)w.style.background='linear-gradient(135deg,#ff6b6b 0%,#ee5a52 100%)';}function remove(delay){setTimeout(function(){if(w){w.style.opacity='0';w.style.transform='translateX(100%)';setTimeout(function(){w&&w.parentNode&&w.parentNode.removeChild(w)},300)}},delay||5000)}try{create();update('🔍 Analysiere Seite...','Suche nach Coupon-Elementen',10);setTimeout(function(){var c=document.querySelector('pb-coupon-center');if(!c){update('❌ Fehler','Keine Payback-Coupon-Seite gefunden.<br>Stellen Sie sicher, dass Sie auf payback.de sind.',100,true);remove();return}update('🔍 Prüfe Struktur...','Shadow DOM wird analysiert',20);setTimeout(function(){if(!c.shadowRoot){update('❌ Fehler','Shadow DOM nicht verfügbar.<br>Die Seitenstruktur könnte sich geändert haben.',100,true);remove();return}var coupons=c.shadowRoot.querySelectorAll('pbc-coupon');if(coupons.length===0){update('ℹ️ Keine Coupons','Keine aktivierbaren Coupons gefunden.<br>Möglicherweise sind alle bereits aktiviert.',100);remove();return}update('📊 Gefunden: '+coupons.length+' Coupons','Beginne mit der Aktivierung...',30);var activated=0,skipped=0,processed=0;for(var i=0;i<coupons.length;i++){(function(coupon,index){setTimeout(function(){var prog=30+(index/coupons.length)*60;update('⚡ Aktiviere Coupon '+(index+1)+'/'+coupons.length,'Verarbeite Coupon '+(index+1)+'...<br>Aktiviert: '+activated+' | Übersprungen: '+skipped,prog);try{if(coupon.shadowRoot){var btn=coupon.shadowRoot.querySelector('pbc-coupon-call-to-action');if(btn&&btn.shadowRoot){var activateBtn=btn.shadowRoot.querySelector('.not-activated');if(activateBtn){activateBtn.click();activated++;console.log('✅ Coupon '+(index+1)+' erfolgreich aktiviert');update('✅ Coupon '+(index+1)+' aktiviert!','Aktiviert: '+activated+' | Übersprungen: '+skipped+' | Verbleibend: '+(coupons.length-index-1),prog)}else{skipped++;console.log('⏭️ Coupon '+(index+1)+' bereits aktiviert')}}else skipped++}else skipped++}catch(e){skipped++;console.warn('⚠️ Fehler bei Coupon '+(index+1)+':',e)}processed++;if(processed===coupons.length){setTimeout(function(){var end=new Date(),dur=(end-s)/1000;if(activated>0){update('🎉 Erfolgreich abgeschlossen!','✅ '+activated+' Coupons aktiviert<br>⏭️ '+skipped+' bereits aktiviert<br>⏱️ Dauer: '+dur.toFixed(1)+'s<br>💰 Bereit zum Sparen!',100);setTimeout(function(){if(confirm('🔄 Seite neu laden um Änderungen zu sehen?')){location.reload()}else{remove(3000)}},2500)}else{update('ℹ️ Vorgang abgeschlossen','Keine neuen Coupons aktiviert<br>⏭️ '+skipped+' bereits aktiviert<br>⏱️ Dauer: '+dur.toFixed(1)+'s',100);remove()}},800)}},index*400)})(coupons[i],i)}},500)},300)}catch(e){console.error('Bookmarklet Fehler:',e);update('❌ Unerwarteter Fehler','Fehlerdetails: '+e.message+'<br>Prüfen Sie die Konsole für weitere Informationen.',100,true);remove()}})();
```

### **Schritt 2:** Neues Lesezeichen anlegen & Code als URL einfügen

![Screenshot Schritt 2](docs/images/step2_placeholder.png)
1. **Rechtsklick** in deine Browser-Lesezeichen-Leiste
2. **"Neues Lesezeichen hinzufügen"** wählen
3. **Name:** "Payback Coupon-Klicker"
4. **URL:** Den kompletten Code aus Schritt 1 hier einfügen

### **Schritt 3:** Auf payback.de gehen und Bookmarklet klicken

![Screenshot Schritt 3](docs/images/step3_placeholder.png)
1. Gehe zu [payback.de](https://payback.de) und melde dich an
2. Navigiere zur Coupon-Seite
3. Klicke auf dein neues Lesezeichen "Payback Coupon-Klicker"
4. Alle verfügbaren Coupons werden automatisch aktiviert!

---

## **🎉 Fertig! 🎉**

**Glückwunsch!** Dein Payback Coupon-Klicker ist jetzt einsatzbereit und du sparst dir das mühsame manuelle Aktivieren aller Coupons. Ab sofort einfach auf das Bookmarklet klicken und entspannt alle Vorteile mitnehmen! 🛒💰

## **3. So benutzt du den Coupon-Klicker**

Gehe auf die Payback-Coupon-Seite und klicke auf dein neues Lesezeichen - alle Coupons werden automatisch aktiviert! ⚡

## **4. FAQ - Die 3 häufigsten Fragen**

### **❓ Es passiert nichts, wenn ich auf das Lesezeichen klicke**
**Antwort:** Du musst zuerst auf der Payback-Coupon-Seite sein. Das Tool funktioniert nur dort, wo auch Coupons zum Sammeln da sind.

### **❓ Werden wirklich alle Coupons gesammelt?**
**Antwort:** Ja! Das Tool findet automatisch alle verfügbaren Coupons auf der Seite und aktiviert sie nacheinander.

### **❓ Ist das sicher für mein Payback-Konto?**
**Antwort:** Absolut! Das Tool macht nur das Gleiche wie du - es klickt die Coupon-Buttons an. Es greift nicht auf deine Kontodaten zu.

---

*Viel Spaß beim Sammeln deiner Coupons! 🛒💰*
