const fs = require('fs');
fetch('https://mudraethnic.com/products/madhuri-dixit-premium-fendy-satin-designer-saree-collection')
  .then(r => r.text())
  .then(html => {
    const videos = html.match(/https:\/\/[^\s"'<>]+\.(mp4|m3u8)/gi);
    console.log('Product Videos:', videos ? [...new Set(videos)] : 'None');
  });
