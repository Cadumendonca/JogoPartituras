# Mestre da Partitura - Prática de Leitura Musical

Este é um mini-game interativo projetado para ajudar músicos e estudantes de música a treinarem sua velocidade de identificação de notas na partitura. O foco principal foi criar uma ferramenta que seja ao mesmo tempo esteticamente premium e funcionalmente eficaz para o aprendizado.

## 🧠 Como o Jogo foi Pensado

O objetivo central foi reduzir a fricção entre a leitura da nota e a resposta motora. Para isso, o design seguiu alguns princípios fundamentais:

1.  **Fidelidade Visual**: Mesmo com um tema moderno e escuro disponível para a interface, a "folha" da partitura permanece sempre branca com linhas pretas. Isso foi feito para garantir que o cérebro do estudante se conecte instantaneamente ao padrão que encontrará em partituras reais.
2.  **Teclado de Piano Virtual**: Em vez de botões genéricos, a interface de resposta simula as teclas de um piano. Isso cria uma forte conexão motora para pianistas. O nome das notas pode ser ocultado nas configurações para um desafio mais avançado.
3.  **Síntese de Áudio (Web Audio API)**: Ao acertar uma nota, o jogo gera e toca a frequência exata (em Hz) correspondente àquela nota musical. Essa resposta tátil/sonora ajuda significativamente no treinamento do ouvido absoluto e relativo.
4.  **Feedback Imediato**: O jogo utiliza efeitos visuais (overlays verdes e vermelhos) e animações de "shake" para dar feedback instantâneo sobre o acerto ou erro.
5.  **Flexibilidade de Estudo**: Opção de praticar tanto a **Clave de Sol** quanto a **Clave de Fá**, ou ambas simultaneamente.
6.  **Customização**: Ajuste o tempo de resposta, o intervalo entre as notas, ligue/desligue o som e os nomes das teclas.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias web puras (Vanilla) para garantir máxima performance e portabilidade:

*   **HTML5**: Estrutura semântica e acessível.
*   **CSS3**: Design moderno com variáveis CSS, Glassmorphism, cálculos matemáticos (`calc()`) para posicionamento responsivo do teclado e animações fluidas.
*   **JavaScript (ES6+)**: Motor do jogo, gerenciamento de estado e manipulação dinâmica do DOM.
*   **Web Audio API**: Geração procedural (síntese) dos sons das notas utilizando osciladores em Vanilla JS, eliminando a necessidade de baixar arquivos de áudio pesados e driblando bloqueios de Autoplay em navegadores de celular.
*   **SVG**: Utilizado para desenhar a pauta e usar fontes unicode perfeitas para as claves musicais.

## 📱 Responsividade

O jogo foi otimizado para ser "Mobile-First". O painel de configurações e os controles foram desenhados para serem facilmente acessíveis em telas pequenas, garantindo que a prática possa ser feita em qualquer lugar.

## 🚀 Como Rodar

Basta abrir o arquivo `index.html` em qualquer navegador moderno. Não há necessidade de servidores ou instalações complexas.

---
Desenvolvido com foco na excelência musical e visual.
