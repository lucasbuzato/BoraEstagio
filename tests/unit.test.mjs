import test from 'node:test'
import assert from 'node:assert/strict'
import { jobs, plans } from '../src/data.js'
import { calculateMatch, contrastRatio, escapeHTML, formatCurrency, normalizeCardNumber, normalizeExpiry, splitLines } from '../src/utils.js'

test('modelo comercial preserva preços do projeto', () => {
  assert.equal(plans.find((plan) => plan.id === 'start').price, 29.9)
  assert.equal(plans.find((plan) => plan.id === 'premium').price, 99.9)
})

test('vaga principal preserva a compatibilidade documental de 70%', () => {
  assert.equal(jobs[0].match, 70)
  assert.ok(jobs[0].matched.length > 0)
  assert.ok(jobs[0].gaps.length > 0)
})

test('cálculo de aderência é determinístico e explicável', () => {
  assert.equal(calculateMatch(['HTML', 'CSS', 'Git'], ['HTML', 'CSS', 'JavaScript', 'Git']), 75)
  assert.equal(calculateMatch([], ['HTML']), 0)
})

test('utilitários de formulário normalizam cartão e validade', () => {
  assert.equal(normalizeCardNumber('4242-4242-4242-4242x'), '4242 4242 4242 4242')
  assert.equal(normalizeExpiry('1230'), '12/30')
})

test('conteúdo dinâmico é escapado', () => {
  assert.equal(escapeHTML('<script>'), '&lt;script&gt;')
  assert.deepEqual(splitLines('HTML\n\nCSS  '), ['HTML', 'CSS'])
})

test('formatação monetária usa real brasileiro', () => {
  assert.match(formatCurrency(29.9), /29,90/)
})

test('pares principais de cor atendem contraste AA para texto normal', () => {
  assert.ok(contrastRatio('#08796f', '#ffffff') >= 4.5, 'teal sobre branco')
  assert.ok(contrastRatio('#0b202a', '#f8f7f2') >= 4.5, 'ink sobre cream')
  assert.ok(contrastRatio('#ffffff', '#102f3f') >= 4.5, 'branco sobre ink')
})
