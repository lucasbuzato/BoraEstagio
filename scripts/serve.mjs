import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import process from 'node:process'

const port = Number(process.env.PORT || 4173)
const root = resolve(process.argv.includes('--dist') ? 'dist' : '.')
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
}

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
    const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '')
    const safePath = normalize(relative).replace(/^(\.\.[/\\])+/, '')
    let filePath = join(root, safePath)
    try {
      const info = await stat(filePath)
      if (info.isDirectory()) filePath = join(filePath, 'index.html')
    } catch {
      filePath = join(root, 'index.html')
    }
    const body = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': mime[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    })
    response.end(body)
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(`Erro ao servir o projeto: ${error.message}`)
  }
})

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`BoraEstágio disponível em http://127.0.0.1:${port}\n`)
})
