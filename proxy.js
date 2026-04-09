'use strict'

const https = require('https')
const http = require('http')
const httpProxy = require('http-proxy')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const BACKEND = 'http://192.168.0.17:8080'
const METRO = 'http://localhost:8081'
const PORT = 8443

const CERT_DIR = path.join(__dirname, '.dev-certs')
const KEY = path.join(CERT_DIR, 'key.pem')
const CERT = path.join(CERT_DIR, 'cert.pem')

if (!fs.existsSync(KEY) || !fs.existsSync(CERT)) {
  fs.mkdirSync(CERT_DIR, { recursive: true })
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${KEY}" -out "${CERT}" -days 365 -nodes -subj "/CN=localhost"`,
    { stdio: 'pipe' },
  )
  console.log('Generated self-signed certificate in .dev-certs/')
}

const proxy = httpProxy.createProxyServer({ secure: false })

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message)
  if (!res.headersSent) res.writeHead(502)
  res.end('Bad gateway')
})

const server = https.createServer({ key: fs.readFileSync(KEY), cert: fs.readFileSync(CERT) }, (req, res) => {
  const isApi = req.url.startsWith('/api')
  const target = isApi ? BACKEND : METRO
  console.log(`${req.method} ${req.url} → ${isApi ? 'BACKEND' : 'METRO'}`)
  proxy.web(req, res, { target, changeOrigin: true })
})

// Forward WebSocket upgrades so Metro HMR works through the proxy
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: METRO })
})

server.listen(PORT, () => {
  console.log(`\nProxy → https://localhost:${PORT}`)
  console.log(`  /api/* → ${BACKEND}`)
  console.log(`  /*     → ${METRO}`)
  console.log('\nAccept the self-signed cert warning in your browser on first visit.\n')
})
