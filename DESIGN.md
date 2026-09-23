# Design da BoraEstágio — v2 “Primeiro movimento”

## Tese de personalidade

A BoraEstágio representa o instante em que estudo, repertório e vontade deixam de ser preparação abstrata e viram um primeiro movimento profissional.

A interface deve ser reconhecível sem depender do logo por três sinais combinados:

1. linha de percurso com ponto de partida, dobra e seta;
2. linguagem editorial de caderno, currículo, crachá e anotação;
3. contraste entre papel/creme, navy estrutural e cores de marca francas.

## Traços e anti-traços

| Traço desejado | Decisão observável |
|---|---|
| Jovem sem infantilizar | Cor forte, numeração editorial e frases diretas; sem mascotes ou linguagem infantil |
| Expressiva sem perder confiança | Cobalto, coral e amarelo em áreas delimitadas; informação crítica permanece em superfícies estáveis |
| Acolhedora para estudante e objetiva para empresa | Landing narrativa e vetorial; formulários, checkout e dashboard mais operacionais |

A interface não deve parecer genérica, futurista sem motivo, corporativa fria, excessivamente decorativa nem produzida por uma coleção de padrões visuais de “IA”.

## Princípios de produto

1. **Clareza antes de persuasão:** remuneração, requisitos, gratuidade e recorrência aparecem antes da ação.
2. **Dois públicos, uma linguagem:** estudante recebe acolhimento; empresa recebe densidade operacional; ambos reconhecem a mesma marca.
3. **Valor antes do paywall:** a empresa publica e recebe candidatos antes do upgrade.
4. **Orientação, não sentença:** aderência explica critérios e nunca garante resultado.
5. **Monetização sem coerção:** destaque, Bora PRO e parceiro são opcionais e identificados.
6. **Movimento com propósito:** animação reforça percurso, entrada e confirmação; nunca esconde informação nem causa layout shift.

## Marca

O símbolo combina:

- **ponto coral:** o ponto de partida;
- **caminho navy:** percurso e construção;
- **dobra:** mudança de direção durante a formação;
- **seta cobalto:** ação seguinte;
- **sublinhado amarelo:** marcação de caderno no wordmark.

Arquivos vetoriais:

- `src/assets/brand/boraestagio-mark.svg`;
- `src/assets/brand/boraestagio-wordmark.svg`.

A mesma geometria aparece no favicon e nos ícones de percurso. O símbolo foi verificado em header desktop, header mobile, sidebar e rodapé, sobre fundos claros e escuros.

## Paleta

| Papel | Valor | Uso |
|---|---|---|
| Navy | `#18254a` | estrutura, fundos escuros e confiança |
| Cobalto | `#2457f5` | ação principal, links e progresso |
| Coral | `#ff6b4a` | ponto de partida, marcações e contraste |
| Amarelo-sol | `#ffd84d` | energia, sublinhado e seções editoriais |
| Menta | `#c9f2d7` | contraponto leve e superfícies de apoio |
| Papel | `#fffcf6` | cards e leitura |
| Creme | `#fff7e8` | canvas e referência a caderno |
| Texto | `#10182f` | conteúdo principal |
| Sucesso | `#15724b` | estados positivos |
| Erro | `#b42318` | validação e alerta |

A implementação preserva alguns nomes de tokens legados por compatibilidade interna, mas os valores finais seguem esta paleta.

## Tipografia e composição

A tipografia usa pilha local (`Avenir Next`, `Segoe UI Variable`, `Segoe UI`, system-ui), sem downloads externos. Títulos têm peso alto e entrelinha curta; textos funcionais priorizam leitura.

A gramática visual usa:

- cantos menores e superfícies mais rígidas;
- bordas visíveis e sombras deslocadas;
- numeração `01`, `02`, `03` em formulários e jornadas;
- etiquetas editoriais, linhas pontilhadas e sublinhados amarelos;
- painéis vetoriais com rotas, marcos e etiquetas;
- espaço negativo para separar narrativa de operação.

Foram removidos como linguagem dominante: monograma em quadrado arredondado, órbitas decorativas, sparkles, gradientes difusos, glassmorphism, cards flutuantes e arredondamento excessivo.

## Ilustrações vetoriais

As imagens de banco foram substituídas por dois componentes próprios e específicos do domínio:

1. **Mapa do começo:** conecta curso, projetos e primeira oportunidade em uma rota triangular.
2. **Travessia profissional:** apresenta campus, oportunidade clara e primeiro time como estações de um percurso.

Os componentes usam HTML e SVG inline, permanecem nítidos em qualquer densidade de tela e não dependem de enquadramento de pessoas, licença externa ou carregamento de arquivos raster. As legendas mantêm o significado disponível quando o movimento é reduzido.

## Movimento

- desenho progressivo da rota no mapa do começo;
- entrada sequencial dos três marcos;
- marcador que percorre campus, oportunidade e primeiro time;
- revelações verticais curtas para blocos de conteúdo;
- deslocamento discreto da seta no hover da marca;
- entrada sequencial em confirmação.

O movimento usa `transform`, `opacity` e `stroke-dashoffset`, evitando recalcular layout. Com `prefers-reduced-motion: reduce`, rotas, marcos e textos aparecem imediatamente no estado final e o marcador decorativo é ocultado.

## Aderência explicada

O componente foi refeito para impedir disputa entre o número de 70%, os critérios e o aviso ético.

Estrutura:

1. percentual em área própria;
2. barra ou anel de progresso;
3. critérios identificados;
4. pontos para desenvolver;
5. aviso explícito de que a leitura não decide aprovação ou reprovação.

No sucesso da candidatura, o painel muda de duas colunas para uma coluna em telas estreitas. Nenhum elemento usa posicionamento que possa cobrir o texto.

## Arquitetura da informação

### Empresa

1. Página inicial
2. Cadastro empresarial
3. Criação de vaga
4. Revisão e destaque opcional
5. Confirmação da publicação
6. Painel de candidatos
7. Aviso de upgrade
8. Comparação de planos
9. Checkout
10. Plano ativo e recurso desbloqueado

### Estudante

1. Página inicial
2. Cadastro e perfil
3. Lista de vagas
4. Detalhes
5. Revisão
6. Confirmação
7. Aderência e ofertas opcionais
8. Acompanhamento

## Componentes e estados

- Header responsivo, menu móvel e skip link.
- Botões primário, secundário, fantasma e compacto.
- Cards de papel, vaga, plano, candidato e serviço opcional.
- Inputs, selects, textarea, checkbox e upload simulado.
- Stepper de fluxo.
- Diálogos nativos com Escape e retorno de foco.
- Toast com região `aria-live`.
- Estados de sucesso, lista vazia, recurso bloqueado, plano ativo, formulário inválido e rota inexistente.
- Tabela empresarial com rolagem horizontal dentro do componente em telas estreitas.

## Responsividade

- **390 px:** uma coluna, ações empilhadas, menu móvel e tabela contida.
- **768 px:** grids intermediários, formulários reorganizados e títulos protegidos contra quebra inadequada no hífen.
- **1440 px:** composição editorial completa, painéis laterais e conteúdo limitado a 1180 px.

Há breakpoints adicionais em 560, 720, 930, 1120 e 1300 px para evitar mudanças abruptas entre essas três referências.

## Acessibilidade incorporada

- idioma e títulos significativos;
- landmarks e hierarquia de headings;
- labels persistentes;
- foco visível;
- skip link;
- nome acessível em botões de ícone;
- informação que não depende somente de cor;
- legendas descritivas para ilustrações decorativas;
- `prefers-reduced-motion`;
- atualizações por toast em `aria-live`.

Isso não equivale a conformidade WCAG completa; os limites estão em `VALIDATION.md`.

## Decisões rejeitadas

- **Cobrar antes de publicar:** elimina a experimentação do plano grátis.
- **Mostrar “100% compatível”:** cria precisão falsa e interpretação de garantia.
- **IA decisória no MVP:** não há dados, governança ou backend para sustentá-la.
- **Logo baseada apenas na letra B em um quadrado:** não comunica o domínio nem passa no teste de reconhecimento.
- **Órbitas, brilho e gradiente como identidade:** reforçam aparência genérica de produto de IA.
- **Fotografias de grupo com recorte fechado:** criavam protagonismo involuntário e perdiam o sentido coletivo em telas diferentes.
- **Imagem remota em runtime:** quebraria o uso offline e a previsibilidade dos prints.
- **Logos de FIAP ou empresas reais na interface:** não são necessários e poderiam sugerir endosso.
- **React sem necessidade funcional:** adicionaria toolchain a um protótipo estático que já testa a hipótese completa.
