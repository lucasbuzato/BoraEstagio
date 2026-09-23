# Relatório de validação — BoraEstágio v2

Data da execução final: **23/09/2026**  
Contrato: **protótipo HTML/CSS/JavaScript offline**  
Ambiente: Node.js 24, Chromium via Playwright, Linux sandbox.

## Resultado executivo

**Aprovado no escopo testado.** A suíte completa passou após a revisão visual “Primeiro movimento” e as capturas impactadas foram reinspecionadas individualmente.

## Evidências

| Verificação | Método | Resultado | Evidência | Limite |
|---|---|---|---|---|
| Sintaxe | `npm run typecheck` com `node --check` | Passou | `artifacts/final-validation-v2.log` | JavaScript; não é TypeScript |
| Lint estático | `npm run lint` | Passou | 5 arquivos e 13 rotas obrigatórias verificadas | Regras locais, não ESLint |
| Testes unitários | `npm test` | Passou: 7/7 | Preços, aderência, sanitização, formulário e contraste | Funções puras e dados críticos |
| Build | `npm run build` | Passou | `dist/` gerada com manifesto e ativos locais | Build estático sem minificação |
| Fluxo estudante | Playwright no Chromium | Passou | Cadastro → busca → vaga → revisão → confirmação → aderência → diálogo opcional | Dados fictícios; sem backend |
| Fluxo empresa | Playwright no Chromium | Passou | Cadastro → publicação → painel → planos → checkout → filtros desbloqueados | Pagamento simulado |
| Responsividade | 15 rotas em 390, 768 e 1440 px | Passou | 27 PNGs automatizados; mais 2 evidências dirigidas em 1356 px | Chromium |
| Overflow | Tentativa de rolagem global e leitura de dimensões | Passou | Nenhuma das 15 rotas gerou overflow global nas três larguras | Tabela usa rolagem interna |
| Teclado | Tab, menu móvel e Escape em diálogo | Passou | Assertions do Playwright | Sem leitor de tela |
| Texto ampliado | `font-size` raiz a 200% na página inicial | Passou | CTA principal permaneceu visível e utilizável | Aproximação de zoom textual |
| Contraste | Cálculo WCAG dos pares principais | Passou | Teste unitário de três combinações críticas | Não mede todo estado/pixel |
| Movimento reduzido | Contexto E2E com `reduced_motion="reduce"` | Passou | Conteúdo visível e fluxos completos | Não mede preferência em todos os SOs |
| Console | Captura de `console.error` e `pageerror` | Passou: 0 ocorrências | `artifacts/e2e-results.json` | Chromium local |
| Rede | Monitoramento de requests | Passou: 0 requests externos | `artifacts/e2e-results.json` | Durante a suíte executada |
| Inspeção visual | Capturas desktop e responsivas abertas individualmente | Passou | 27 capturas automatizadas, hero em 1356 × 699 px e travessia capturada durante a animação | Revisão humana sem teste com usuários |

## Cobertura visual final

### Página inicial

- mapa vetorial “curso → projetos → primeira oportunidade” legível em 390, 768, 1356 e 1440 px;
- travessia “campus → oportunidade → primeiro time” legível nas mesmas larguras;
- nenhum arquivo raster ou pessoa recortada na landing;
- componente “70% / Compatibilidade com contexto” sem sobreposição;
- CTA e rodapé sem corte ou overflow.

### Detalhe da vaga

- “Front‑end” permanece unido visualmente em 390, 768 e 1440 px;
- valor usado pela busca e pelos dados continua sendo `front-end`;
- painel de candidatura muda de posição sem cobrir o conteúdo.

### Sucesso da candidatura

- anel de 70%, título, aviso, critérios identificados e pontos para desenvolver mantêm áreas próprias;
- painel muda de duas colunas para uma coluna em 390 px;
- ofertas opcionais continuam separadas e o aviso de não influência permanece visível.

### Checkout

- símbolo de percurso substituiu o sparkle no plano;
- estrela permanece reservada ao Destaque de Vaga;
- resumo, recorrência e total estão legíveis em 390, 768 e 1440 px.

## Problemas encontrados e corrigidos

1. **Tabela de candidatos excedia o viewport em 390 px.**  
   Correção: contenção do grid e rolagem horizontal somente dentro do componente.
2. **Menu móvel permanecia visível se o viewport aumentasse depois de aberto.**  
   Correção: menu oculto por padrão e exibido apenas dentro do breakpoint móvel.
3. **No mobile, a compatibilidade aparecia antes da confirmação da candidatura.**  
   Correção: restauração da ordem semântica.
4. **O bloco de 70% disputava espaço e podia sobrepor a explicação.**  
   Correção: reconstrução em regiões explícitas e breakpoints próprios.
5. **A segunda fotografia aparecia como um quadro amarelo vazio em capturas full-page.**  
   Correção intermediária: remoção de `loading="lazy"`; a solução fotográfica foi posteriormente substituída pelo componente vetorial do item 9.
6. **“Front-end” podia quebrar no hífen e deixar “end” isolado.**  
   Correção: hífen não separável somente na camada de apresentação, preservando dados e busca.
7. **O checkout ainda continha um sparkle genérico.**  
   Correção: plano usa o símbolo de percurso; a definição não utilizada foi removida.
8. **O percurso SVG do hero atravessava os rostos das estudantes.**  
   Correção intermediária: remoção da sobreposição; a fotografia inteira foi posteriormente substituída pelo mapa vetorial do item 9.
9. **As duas fotografias usavam recortes fechados e criavam protagonismo involuntário.**  
   Correção: substituição por componentes vetoriais próprios; o hero mostra curso → projetos → oportunidade e a seção seguinte mostra campus → oportunidade → primeiro time, ambos com movimento acessível.

## Resultado da execução final

- lint: passou;
- análise sintática: passou;
- unitários: **7/7**;
- build: passou;
- fluxo estudante: passou;
- fluxo empresa: passou;
- telas documentais: **15**;
- capturas automatizadas: **27**;
- reproduções visuais adicionais das ilustrações: **hero em 1356 × 699 px e travessia animada**;
- larguras automatizadas: **390, 768 e 1440 px**;
- largura dirigida adicional: **1356 px**;
- erros de console: **0**;
- exceções de página: **0**;
- requisições externas: **0**.

## O que foi provado

- O projeto executa sem dependências externas de runtime.
- Os dois fluxos principais chegam ao estado final.
- O plano pago desbloqueia filtros após o checkout simulado.
- A candidatura é concluída sem cobrança.
- As 15 telas permanecem navegáveis nas três larguras testadas.
- A identidade v2 permanece coerente entre landing, formulários, dashboard e checkout.
- As ilustrações são HTML/SVG inline; o runtime não depende de imagens de banco ou licenças externas.
- O conteúdo continua operável com movimento reduzido.

## O que continua hipótese

- disposição real das empresas para pagar;
- utilidade percebida da porcentagem de aderência;
- conversão do Bora PRO e de cursos parceiros;
- qualidade de matching com dados reais;
- reconhecimento espontâneo da identidade com usuários reais;
- usabilidade com estudantes e recrutadores reais.

## Limites conhecidos

- Não há backend, autenticação, upload, e-mail ou cobrança reais.
- Não houve teste com leitor de tela nem auditoria WCAG completa.
- O matching é demonstrativo e não usa inteligência artificial.
- Safari e Firefox não foram executados neste ambiente.
- Os preços continuam hipóteses comerciais do trabalho anterior.
