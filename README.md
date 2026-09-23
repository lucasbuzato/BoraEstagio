# BoraEstágio — MVP navegável

Protótipo funcional criado para a atividade **Startup One — Construindo o MVP**. A aplicação demonstra publicação de vaga, candidatura gratuita e aquisição simulada de plano corporativo.

A revisão visual atual é a **v2 — Primeiro movimento**: uma identidade inspirada no percurso entre campus, currículo e primeiro time, sem alterar os fluxos e as regras comerciais já validados.

## Executar

Requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:4173`.

O projeto não possui dependências de produção. O servidor usa somente módulos nativos do Node e a aplicação funciona offline.

### Requisito opcional dos testes E2E

A aplicação não precisa de Playwright para funcionar. Apenas `npm run test:e2e` e `npm run validate` exigem Python 3, o pacote Python `playwright` e um Chromium disponível. Esses itens pertencem ao ambiente de QA e não são instalados por `npm install`.

## Comandos

```bash
npm run dev        # servidor local
npm run lint       # verificações estáticas do projeto
npm run typecheck  # análise sintática dos módulos JavaScript
npm test           # testes unitários com o test runner do Node
npm run build      # gera a pasta dist/
npm run test:e2e   # fluxos reais no Chromium via Playwright
npm run validate   # lint + sintaxe + unitários + build + E2E
```

## Fluxos demonstrados

### Empresa

Início → cadastro → criação e revisão da vaga → publicação gratuita → painel de candidatos → recurso bloqueado → planos → checkout → plano ativo e filtros desbloqueados.

### Estudante

Início → cadastro e perfil → busca de vagas → detalhes → revisão → candidatura gratuita → confirmação → aderência explicada → acompanhamento e serviços opcionais separados.

## Modelo comercial representado

- Empresa Grátis: R$ 0, até uma vaga ativa e visualização básica.
- Start: R$ 29,90/mês.
- Pro: R$ 59,90/mês.
- Premium: R$ 99,90/mês.
- Destaque de Vaga: R$ 9,90, compra única opcional.
- Bora PRO: R$ 12,90/mês, opcional para estudantes.
- Parcerias educacionais: comissão variável e identificada.

A candidatura estudantil é gratuita do início ao acompanhamento. Nenhuma compra altera posição ou chance no processo seletivo. A aderência é uma regra demonstrativa e explicável, não uma decisão automatizada.

## Identidade visual v2

- Conceito: **Primeiro movimento**.
- Marca: ponto coral de partida, caminho navy, dobra e seta cobalto; wordmark com sublinhado amarelo.
- Paleta: navy, cobalto, coral, amarelo-sol, menta e papel/creme.
- Gramática: linha de percurso, numeração editorial, etiquetas, marcações de caderno, painéis vetoriais rígidos e sombras deslocadas.
- Ilustrações: dois componentes vetoriais próprios representam curso → projetos → primeira oportunidade e campus → primeiro time, sem imagens de banco.
- Movimento: rotas desenhadas, marcos sequenciais, marcador de travessia, entrada de confirmação e microinteração da marca; o estado final permanece completo com `prefers-reduced-motion: reduce`.

## Estrutura

```text
.
├── index.html
├── src/
│   ├── app.js                 # páginas, componentes, rotas e interações
│   ├── data.js                # vagas, candidatos, planos e estado fictício
│   ├── styles.css             # tokens, componentes, movimento e responsividade
│   ├── utils.js               # funções puras e formatação
│   └── assets/
│       └── brand/             # símbolo e wordmark vetoriais
├── scripts/
│   ├── serve.mjs
│   ├── build.mjs
│   └── lint.mjs
├── tests/
│   ├── unit.test.mjs
│   └── e2e.py
├── DESIGN_CONTEXT.md
├── DESIGN.md
└── VALIDATION.md
```

## Dados e persistência

- Todos os nomes, empresas, candidatos, vagas, e-mails e pagamentos são fictícios.
- O estado fica no `localStorage` do navegador.
- Não existe backend, autenticação real, envio de candidatura, pagamento ou integração externa.
- O rodapé oferece **Reiniciar demonstração** para limpar o estado.

## Evidências

- Resultado estruturado: `artifacts/e2e-results.json`.
- Log da validação final: `artifacts/final-validation-v2.log`.
- Capturas: `artifacts/screenshots/` — 15 telas documentais em 1440 px, 12 evidências responsivas e reproduções específicas das ilustrações vetoriais.
- Relatório consolidado: `VALIDATION.md`.

## Limitações reais

- É um protótipo acadêmico, não um produto em produção.
- Checkout, login, upload e notificações são simulações locais identificadas.
- O matching usa dados mockados e regras transparentes; não existe IA decisória.
- Não houve auditoria WCAG completa, teste com leitor de tela ou teste com usuários.
- Os preços são hipóteses comerciais derivadas do trabalho anterior.

## Rede

A interface funciona sem internet e não carrega fontes, imagens, bibliotecas, analytics ou APIs externas. As ilustrações são compostas por HTML, CSS e SVG inline.
