import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve('.')
const dist = resolve('dist')
await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(resolve(root, 'src'), resolve(dist, 'src'), { recursive: true })
const html = await readFile(resolve(root, 'index.html'), 'utf8')
await writeFile(resolve(dist, 'index.html'), html)
await writeFile(resolve(dist, '404.html'), html)
const manifest = {
  name: 'BoraEstágio MVP',
  generatedAt: new Date().toISOString(),
  entry: 'index.html',
  mode: 'static-offline'
}
await writeFile(resolve(dist, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
process.stdout.write('Build concluído em dist/.\n')
