#!/usr/bin/env node

const fs = require('fs');
const { minify } = require('terser');
const path = require('path');

async function buildBookmarklet() {
  try {
    console.log('🔨 Generiere minifizierten Bookmarklet-Code...');
    
    // JavaScript-Code aus der Bookmarklet-Datei lesen
    const bookmarkletPath = path.join(__dirname, 'payback-coupon-bookmarklet.js');
    const rawCode = fs.readFileSync(bookmarkletPath, 'utf8');
    
    // "javascript:" Präfix entfernen für die Minifizierung
    const jsCode = rawCode.replace(/^javascript:\s*/, '').trim();
    
    // Code minifizieren
    const minified = await minify(jsCode, {
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: false // Console-Statements behalten für Debugging
      },
      mangle: {
        reserved: ['alert', 'confirm', 'location', 'setTimeout', 'document', 'querySelector', 'querySelectorAll']
      },
      format: {
        comments: false
      }
    });
    
    if (minified.error) {
      throw minified.error;
    }
    
    // Minifizierten Code mit "javascript:" Präfix versehen
    const bookmarkletCode = `javascript:${minified.code}`;
    
    // README.md lesen und aktualisieren
    const readmePath = path.join(__dirname, 'README.md');
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Bookmarklet-Code-Block im README finden und ersetzen
    const codeBlockRegex = /```javascript\s*\n[\s\S]*?\n```/;
    const newCodeBlock = `\`\`\`javascript\n${bookmarkletCode}\n\`\`\``;
    
    if (codeBlockRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(codeBlockRegex, newCodeBlock);
      console.log('✅ README.md wurde aktualisiert');
    } else {
      console.log('⚠️ Kein bestehender Code-Block im README gefunden');
      // Fallback: Code-Block nach "Schritt 1:" einfügen
      const insertionPoint = readmeContent.indexOf('### **Schritt 1:** Code aus Kästchen kopieren');
      if (insertionPoint !== -1) {
        const insertPosition = readmeContent.indexOf('\n', insertionPoint + 1) + 1;
        const beforeInsertion = readmeContent.substring(0, insertPosition);
        const afterInsertion = readmeContent.substring(insertPosition);
        readmeContent = beforeInsertion + '\n' + newCodeBlock + '\n' + afterInsertion;
        console.log('✅ Neuer Code-Block wurde eingefügt');
      }
    }
    
    // README.md speichern
    fs.writeFileSync(readmePath, readmeContent);
    
    // Statistiken anzeigen
    const originalSize = jsCode.length;
    const minifiedSize = minified.code.length;
    const savings = Math.round(((originalSize - minifiedSize) / originalSize) * 100);
    
    console.log('\n📊 Minifizierung abgeschlossen:');
    console.log(`   Original: ${originalSize} Zeichen`);
    console.log(`   Minifiziert: ${minifiedSize} Zeichen`);
    console.log(`   Ersparnis: ${savings}%`);
    console.log('\n🎯 Bookmarklet-Code wurde erfolgreich generiert und in README.md eingefügt!');
    console.log('\n📋 Copy-Paste-bereit:');
    console.log('   Der minifizierte Code ist jetzt im README als ```javascript``` Code-Block verfügbar');
    
  } catch (error) {
    console.error('❌ Fehler beim Generieren des Bookmarklets:', error.message);
    process.exit(1);
  }
}

// Prüfen, ob terser installiert ist
try {
  require('terser');
} catch (error) {
  console.error('❌ Terser ist nicht installiert. Bitte führe "npm install" aus.');
  process.exit(1);
}

buildBookmarklet();
