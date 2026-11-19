// Local-only frame capture for visual checks during development.
import { createServer } from 'node:http'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'shots')
await mkdir(outDir, { recursive: true })

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') return res.writeHead(204).end()
  if (req.method !== 'POST') return res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok')

  const url = new URL(req.url ?? '/', 'http://127.0.0.1:5555')
  const name = (url.searchParams.get('name') ?? 'shot').replace(/[^a-z0-9-_]/gi, '')
  let body = ''
  for await (const chunk of req) body += chunk
  const base64 = body.replace(/^data:image\/\w+;base64,/, '')
  await writeFile(join(outDir, `${name}.png`), Buffer.from(base64, 'base64'))
  res.writeHead(200, { 'Content-Type': 'text/plain' }).end('saved')
}).listen(5555, '127.0.0.1', () => console.log('shot server on 5555'))
