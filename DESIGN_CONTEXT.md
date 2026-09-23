# Pacote de Contexto de Design — BoraEstágio v2

## Contrato escolhido

| Campo | Decisão |
|---|---|
| Modo | SPA estática em HTML, CSS e JavaScript, sem dependências de runtime |
| Motivo | Entrega acadêmica precisa abrir localmente, funcionar offline e preservar os fluxos já validados |
| Escopo | 15 telas principais, dois fluxos conectados, identidade v2, estados de sucesso, formulário, vazio de busca e recursos bloqueados |
| Não escopo | Backend, autenticação real, pagamento real, IA decisória, upload real, entrevista e marketplace completo de cursos |
| Fonte de verdade | Enunciado da atividade, material anterior, regras comerciais fornecidas e decisões registradas neste projeto |
| Audiência | Professor/tutor FIAP e demonstração acadêmica de Lucas Buzato Venarusso |
| Critérios de pronto | Execução limpa, fluxos E2E, zero erro de console, responsividade em 390/768/1440 px, inspeção visual, prints e ZIP |
| Privacidade | Somente dados fictícios; nenhum conteúdo, branding ou informação interna de outros projetos |

## Problema e objetivo

Estudantes precisam compreender oportunidades e se candidatar sem barreiras financeiras. Empresas precisam publicar vagas, receber candidatos e perceber valor antes de uma assinatura. O MVP prova o percurso e a compreensão do modelo, não demanda de mercado nem viabilidade financeira.

## Jobs to be done

- **Estudante:** “Quando procuro minha primeira oportunidade, quero entender condições e requisitos para me candidatar sem pagar e acompanhar o resultado.”
- **Empresa:** “Quando preciso recrutar alguém em início de carreira, quero publicar uma vaga e organizar candidatos sem adotar um processo complexo.”

## Tese de personalidade

**Primeiro movimento:** transformar curso, projeto e vontade de aprender em uma rota profissional visível.

### Traços obrigatórios

1. jovem sem infantilizar;
2. expressiva sem perder confiança;
3. acolhedora para estudante e objetiva para empresa.

### Anti-traços

1. genérica ou indistinguível de um template SaaS;
2. futurista/“IA” sem razão funcional;
3. corporativa fria, infantil ou decorativa demais.

### Tradução observável

- ponto de partida, caminho, dobra e seta como assinatura de marca e das ilustrações vetoriais;
- cores francas ligadas a energia e ação, não gradientes difusos;
- papel, linhas, etiquetas e numeração que lembram caderno, currículo e portfólio;
- mapas vetoriais que traduzem curso, projetos, oportunidade e primeiro time em marcos observáveis;
- formulários e dashboard com maior sobriedade operacional;
- movimento curto que explica progressão e respeita redução de movimento.

## Tensão de design

A experiência precisa parecer próxima do universo estudantil sem perder credibilidade para quem contrata. A solução usa uma landing editorial e vetorial, enquanto as telas de empresa mantêm densidade, alinhamento e padrões de decisão claros.

## Metáforas de domínio

- **Ponto:** começar com o repertório atual.
- **Linha:** construir caminho, não esperar estar pronto.
- **Dobra:** adaptar-se entre formação e trabalho.
- **Seta:** escolher a próxima ação.
- **Caderno/currículo:** registrar habilidades e evidências.
- **Crachá/primeiro time:** tornar concreta a passagem para o ambiente profissional.

## Teste de reconhecimento sem logo

A tela deve continuar associável ao produto quando a marca é coberta. O teste usa quatro sinais:

1. linha de percurso;
2. composição editorial com numeração;
3. contraste navy/cobalto/coral/amarelo sobre papel;
4. mapa de marcos entre formação e primeiro time.

Passa quando pelo menos três sinais aparecem de forma coerente e não poderiam ser trocados por motivos genéricos de “tecnologia”.

## Requisitos de marca

- legível em header desktop e mobile;
- reconhecível em 24–42 px;
- funcional em fundo claro e escuro;
- símbolo útil sem wordmark;
- sem depender de gradiente, caixa arredondada ou letra isolada;
- favicon derivado da mesma geometria.

## Direção das ilustrações

- componentes próprios, sem imagens de banco ou pessoas recortadas;
- metáforas diretamente ligadas a curso, projetos, vaga e primeiro time;
- texto real em HTML, nunca texto falso dentro de uma imagem;
- rotas e marcos escaláveis em 390, 768, 1356 e 1440 px;
- nenhum elemento animado necessário para compreender o conteúdo;
- cores e ícones consistentes com a marca e com os estados do produto.

## Gramática de movimento

| Movimento | Função | Limite |
|---|---|---|
| Desenho da rota | Mostrar progressão entre os marcos | Executar uma vez ao entrar no viewport |
| Entrada dos marcos | Organizar a ordem curso → projetos → vaga | Atrasos curtos, sem layout shift |
| Marcador de travessia | Reforçar campus → oportunidade → time | Movimento lento e decorativo; oculto com redução de movimento |
| Revelação vertical | Organizar ordem de leitura | Deslocamento pequeno, sem layout shift |
| Seta no hover | Reforçar próximo passo | Microinteração discreta |
| Entrada de confirmação | Comunicar conclusão | Não repetir indefinidamente |

Com `prefers-reduced-motion: reduce`, conteúdo e estado final aparecem imediatamente.

## Matriz de contexto

| Decisão | Evidência | Confiança | Estado | Risco/teste |
|---|---|---:|---|---|
| Estudante não paga para candidatar | Modelo e regras fornecidas | Alta | Confirmada | Testar todos os CTAs e a confirmação |
| Empresa é cliente principal | Modelo de monetização | Alta | Confirmada | Testar upgrade somente após valor gratuito |
| Marketplace possui dois fluxos | Produto de duas pontas | Alta | Confirmada | Executar os dois percursos completos |
| Destaque custa R$ 9,90 | Modelo anterior | Alta | Confirmada | Garantir opção desmarcada e compra única |
| Bora PRO custa R$ 12,90/mês | Modelo anterior | Alta | Confirmada | Separar da seleção e negar vantagem seletiva |
| Planos custam R$ 29,90–99,90 | Modelo anterior | Alta | Confirmada | Verificar valores e recorrência no checkout |
| Compatibilidade aparece após candidatura | Regra de produto | Alta | Confirmada | Explicar critérios e ausência de garantia |
| Matching real por IA | Não existe base ou integração | Alta | Adiada | Usar mock explicável e não alegar IA |
| Personalidade “Primeiro movimento” | Contexto de campus, estágio e primeira carreira | Alta | Implementada | Teste sem logo e auditoria anti-genérica |
| Ilustrações vetoriais próprias | Revisão visual após teste de enquadramento | Alta | Implementada | Verificar legibilidade, significado, movimento e redução de movimento |
| Movimento acessível | Requisito da revisão visual | Alta | Implementada | Testar `prefers-reduced-motion` |

## Falhas que o design precisa evitar

- pay-to-win real ou percebido;
- percentual opaco tratado como sentença;
- sobreposição entre percentual, critérios e aviso;
- plano gratuito que não entrega valor;
- cobrança recorrente ambígua;
- oferta de curso disfarçada de recomendação neutra;
- vaga sem remuneração ou condições claras;
- ilustração genérica, ilegível ou dependente de rede no print;
- hífen que deixe “end” isolado em títulos;
- uso de marcas, dados internos ou empresas reais.

## Gate de personalidade

A entrega só é aceita se:

- a marca representar o domínio, e não apenas uma inicial;
- pelo menos três assinaturas do conceito aparecerem sem logo;
- ilustração, cor e movimento tiverem função narrativa;
- nenhuma tela crítica depender de sparkle, órbita ou glassmorphism;
- landing e telas operacionais pertencerem ao mesmo sistema;
- a identidade permanecer legível em 390, 768 e 1440 px.

## Critérios verificáveis de pronto

- 15 telas documentais e dois fluxos completos;
- candidatura gratuita e checkout empresarial simulados;
- aderência de 70% explicável e sem sobreposição;
- marca v2 aplicada em todos os contextos;
- duas ilustrações vetoriais próprias, legíveis e com redução de movimento;
- movimento com fallback de redução;
- zero overflow global nas três larguras;
- zero erro de console, exceção de página ou request externo durante E2E;
- inspeção humana das capturas críticas;
- documentação, ZIP de código e pacote de prints atualizados.
