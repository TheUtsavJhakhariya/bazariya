/* Tiny static server so fetch() can load config and the CSV.
   Run from anywhere: node tools/serve.js
   Then open http://localhost:8000
   Uses only Node's built-in modules. No npm install. */

var http = require('http');
var fs = require('fs');
var path = require('path');

var root = path.resolve(__dirname, '..');
var port = 8000;

var types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

var server = http.createServer(function (req, res) {
  var pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  } catch (err) {
    send(res, 400, 'Bad request');
    return;
  }

  var rel = pathname.replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';

  var filePath = path.resolve(root, rel);
  var rootPrefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (filePath !== root && filePath.indexOf(rootPrefix) !== 0) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, function (err, data) {
    if (err) {
      send(res, 404, 'Not found');
      return;
    }
    var ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, types[ext] || 'application/octet-stream');
  });
});

server.listen(port, function () {
  console.log('BAZARIYAA is at http://localhost:' + port);
});
