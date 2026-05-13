const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the conflicting inline body style
  content = content.replace(/body\s*\{\s*background:\s*linear-gradient[^}]+\}\s*/g, '');
  
  // If it's index.html, replace the big blue image with a cool fontawesome shield/lock stack
  if (file === 'index.html') {
    const oldImg = '<img src="https://cdn-icons-png.flaticon.com/512/10067/10067068.png" class="hero-img"\r\n          alt="Identity illustration" />';
    const newIllustration = `
        <div class="hero-img-container" style="position: relative; width: 100%; max-width: 400px; margin: 0 auto; animation: float 4s infinite ease-in-out;">
           <div style="font-size: 200px; color: #ef4444; text-shadow: 0 0 40px rgba(239, 68, 68, 0.4);">
             <i class="fa-solid fa-shield-halved"></i>
           </div>
           <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 80px; color: #1c1f26;">
             <i class="fa-solid fa-link"></i>
           </div>
        </div>`;
    content = content.replace(oldImg, newIllustration);
    // some systems might use different line endings
    content = content.replace(/<img src="https:\/\/cdn-icons-png.flaticon.com\/512\/10067\/10067068.png" class="hero-img"[\s\S]*?alt="Identity illustration" \/>/g, newIllustration);
  }

  // Ensure backgrounds are dark and text is properly contrasted
  content = content.replace(/bg-white/g, 'bg-dark');
  content = content.replace(/bg-light/g, 'bg-dark');
  
  fs.writeFileSync(filePath, content);
});

console.log("Cleaned up inline styles and updated hero image.");
