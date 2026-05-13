const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add data-bs-theme="dark" to html tag if not present
  if (!content.includes('data-bs-theme="dark"')) {
    content = content.replace('<html lang="en">', '<html lang="en" data-bs-theme="dark">');
  }
  
  // Replace old inline backgrounds in index.html and others
  content = content.replace(/bg-white/g, 'bg-dark');
  content = content.replace(/text-primary/g, 'text-danger');
  content = content.replace(/btn-primary/g, 'btn-danger');
  content = content.replace(/btn-outline-primary/g, 'btn-outline-danger');
  
  fs.writeFileSync(filePath, content);
});

console.log("HTML files updated for dark theme.");
