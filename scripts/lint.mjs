import { readFile } from 'node:fs/promises'

const files = ['index.html', 'src/app.js', 'src/data.js', 'src/utils.js', 'src/styles.css']
const contents = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])))
const failures = []
const requireText = (file, text, message) => {
  if (!contents[file].includes(text)) failures.push(`${file}: ${message}`)
}
const forbid = (file, expression, message) => {
  if (expression.test(contents[file])) failures.push(`${file}: ${message}`)
}

requireText('index.html', 'lang="pt-BR"', 'idioma do documento não definido')
requireText('index.html', 'class="skip-link"', 'skip link ausente')
requireText('src/styles.css', ':focus-visible', 'estilo de foco visível ausente')
requireText('src/styles.css', 'prefers-reduced-motion: reduce', 'redução de movimento ausente')
requireText('src/app.js', "'/empresa/plano-ativo'", 'rota final do plano ausente')
requireText('src/app.js', "'/candidatura/sucesso'", 'rota final de candidatura ausente')
requireText('src/app.js', 'Nenhum pagamento é necessário', 'gratuidade da candidatura não explicitada')
requireText('src/app.js', 'Comprar serviços não altera sua posição', 'proteção contra pay-to-win ausente')
forbid('src/app.js', /javascript:void/i, 'link artificial encontrado')
forbid('src/app.js', /console\.(log|debug|info)\(/, 'log de desenvolvimento encontrado')
forbid('src/app.js', /https?:\/\//i, 'requisição externa inesperada encontrada')
forbid('src/data.js', /https?:\/\//i, 'URL externa inesperada nos mocks')

const routeScreens = [
  '/empresa/cadastro', '/empresa/vaga/nova', '/empresa/vaga/revisao', '/empresa/vaga/publicada',
  '/estudante/cadastro', '/vagas', '/candidatura/revisao', '/candidatura/sucesso',
  '/empresa/candidatos', '/empresa/upgrade', '/empresa/planos', '/empresa/checkout', '/empresa/plano-ativo'
]
for (const route of routeScreens) requireText('src/app.js', route, `rota obrigatória ausente: ${route}`)

if (failures.length) {
  process.stderr.write(`Falhas de qualidade estática:\n- ${failures.join('\n- ')}\n`)
  process.exit(1)
}
process.stdout.write(`Lint estático concluído: ${files.length} arquivos e ${routeScreens.length} rotas verificadas.\n`)
