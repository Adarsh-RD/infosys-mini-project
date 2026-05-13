const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Force CSS Cache Busting
  content = content.replace(/css\/style\.css(\?v=\d+)?/g, 'css/style.css?v=' + Date.now());
  
  // Make sure feature-card text isn't explicitly set to white or light in HTML, let CSS handle it
  // Wait, the screenshot showed light text. If the CSS handles background well, light text is perfect.
  // Just in case, let's remove any hardcoded "bg-white" that might have been missed
  content = content.replace(/bg-white/g, '');
  content = content.replace(/bg-light/g, '');
  content = content.replace(/text-dark/g, '');
  
  fs.writeFileSync(filePath, content);
});

console.log("Cache busted and classes cleaned.");
