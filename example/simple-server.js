const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'angular-sample/dist/browser');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        // Serve index.html for SPA routing
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err, indexContent) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Angular Idle Detection Demo running at:`);
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log(`   🌐 http://127.0.0.1:${PORT}`);
  console.log('');
  console.log('📱 Features:');
  console.log('   • Industry standard onBackdropClick behavior');
  console.log('   • Real-time idle detection (10 second timeout)'); 
  console.log('   • Event logging with backdrop click demonstration');
  console.log('   • Professional Angular implementation');
  console.log('');
  console.log('🚀 Ready to test! Open the URL above in your browser.');
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('\\n👋 Shutting down server...');
  server.close();
});

process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down server...');
  server.close();
  process.exit(0);
});