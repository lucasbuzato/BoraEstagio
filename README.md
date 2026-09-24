# BoraEstágio

Protótipo navegável de um marketplace fictício que conecta estudantes em início de carreira a empresas com vagas de estágio e posições júnior.

> Todos os nomes, empresas, vagas, candidatos, pagamentos e contatos apresentados na interface são fictícios. Nenhum dado é enviado para serviços externos.

## O que o protótipo demonstra

### Jornada da empresa

Cadastro → criação e revisão da vaga → publicação gratuita → painel de candidatos → comparação de planos → checkout simulado → filtros desbloqueados.

### Jornada do estudante

Cadastro e perfil → busca de vagas → detalhes → revisão da candidatura → confirmação → aderência explicada → acompanhamento.

A candidatura é gratuita. Serviços opcionais não alteram posição, prioridade ou chance no processo seletivo.

## Executar localmente

Requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:4173`.

A aplicação não possui dependências de produção e funciona offline. O estado da demonstração é salvo no `localStorage`; o rodapé oferece a ação **Reiniciar demonstração**.

## Comandos

```bash
npm run dev        # inicia o servidor local
npm run lint       # executa verificações estáticas do projeto
npm run typecheck  # verifica a sintaxe dos módulos JavaScript
npm test           # executa os testes unitários
npm run build      # gera a versão estática em dist/
npm run test:e2e   # valida os fluxos no Chromium com Playwright
npm run validate   # executa toda a suíte de validação
```

Os testes E2E exigem Python 3, o pacote Python `playwright` e um Chromium disponível. Esses itens são necessários apenas para QA e não são instalados pelo `npm install`.

## Estrutura

```text
.
├── index.html
├── src/
│   ├── app.js                  # rotas, páginas, componentes e interações
│   ├── data.js                 # dados fictícios e estado inicial
│   ├── styles.css              # tokens, componentes e responsividade
│   ├── utils.js                # funções puras e formatação
│   └── assets/brand/           # símbolo e wordmark vetoriais
├── scripts/
│   ├── serve.mjs
│   ├── build.mjs
│   └── lint.mjs
└── tests/
    ├── unit.test.mjs
    └── e2e.py
```

## Direção visual

A identidade **Primeiro movimento** traduz a passagem entre formação, repertório e primeira oportunidade profissional.

- paleta com navy, cobalto, coral, amarelo-sol, menta e superfícies de papel;
- marca baseada em ponto de partida, percurso e próxima ação;
- ilustrações vetoriais próprias para representar curso, projetos, oportunidade e primeiro time;
- composição editorial com numeração, etiquetas, linhas e sombras deslocadas;
- animações curtas com estado equivalente para `prefers-reduced-motion: reduce`.

## Acessibilidade e responsividade

- HTML em português brasileiro, landmarks e hierarquia de títulos;
- skip link, labels persistentes e foco visível;
- navegação por teclado e fechamento de diálogos com `Escape`;
- feedback por região `aria-live`;
- informação crítica não depende apenas de cor;
- layouts adaptados para 390, 768 e 1440 px;
- tabelas largas rolam dentro do componente, sem criar overflow global.

## Validação

A suíte automatizada cobre:

- 7 testes unitários para preços, aderência, sanitização, formulário, moeda e contraste;
- os fluxos completos de estudante e empresa;
- as 15 rotas principais em três larguras de referência;
- overflow global, console, requests externos, teclado, texto ampliado e redução de movimento.

Execute `npm run validate` para reproduzir as verificações no ambiente local.

## Limites do protótipo

- não há backend, autenticação, upload, e-mail ou cobrança reais;
- o checkout e as notificações são simulações locais identificadas;
- a aderência usa uma regra demonstrativa e explicável, sem decidir aprovação;
- não houve teste com usuários, leitor de tela nem auditoria WCAG completa;
- os valores dos planos são hipóteses do produto fictício.
