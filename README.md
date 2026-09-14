# Calculadora Comercial — demonstração de portfólio

Simulador estático que compara desconto por faixa e progressivo com um cenário PIX + progressivo, selecionando a maior economia. **Produtos, SKUs, preços e faixas são sintéticos e adaptados para portfólio.** Não representam ofertas reais nem possuem vínculo empresarial. PIX de 5% é uma condição demonstrativa, não uma regra geral do meio de pagamento.

## Como usar

Abra `index.html`. Informe o **valor bruto total do pedido**, sem frete, e somente as **quantidades dos produtos elegíveis a progressivo já incluídos nesse valor**. Deixe zero nos demais. Marque PIX para comparar os dois cenários. Não é necessário cadastrar os demais itens ou informar preços unitários.

A tela mostra a condição vencedora, economia e total final por cenário, progressivo por referência, PIX nas referências elegíveis ao PIX, PIX no restante e próxima faixa. O cálculo é automático. Há temas claro/escuro e layout responsivo.

## Regras da demonstração

| SKU | Produto fictício | Base | 4+ unidades | 8+ unidades |
|---|---|---:|---:|---:|
| DEMO-A | Caderno criativo | R$ 72,00 | R$ 66,00 | R$ 60,00 |
| DEMO-B | Estojo modular | R$ 48,00 | R$ 45,00 | R$ 42,00 |
| DEMO-C | Organizador de mesa | R$ 48,00 | R$ 45,00 | R$ 42,00 |
| DEMO-D | Bloco de notas | R$ 32,00 | R$ 30,00 | R$ 28,00 |

Faixas de fidelidade: abaixo de R$ 1.500,00, 0%; a partir de R$ 1.500,00, 5%; R$ 3.000,00, 10%; R$ 5.000,00, 18%. Catálogo em `rules.js`.

- **Normal:** faixa determinada pelo bruto completo. Cada referência recebe fidelidade ou progressivo, conforme o maior benefício. O restante recebe fidelidade.
- **PIX:** cada referência recebe progressivo somente quando superar 5% de sua base. As demais referências e o restante recebem PIX de 5%. Fidelidade não participa deste cenário.
- Nunca há acúmulo de descontos na mesma unidade. Empate entre cenários mantém normal. Empate por referência usa fidelidade no normal e PIX no cenário PIX.
- Preços em centavos; comparação antes do arredondamento. Fidelidade é arredondada por referência e no restante. PIX é arredondado uma vez sobre todo o bruto que recebe PIX, com rateio cumulativo no detalhamento.
- Valor positivo até R$ 1 bilhão, até duas casas decimais, sem separador de milhar. Quantidades inteiras de 0 a 100.000. Subtotal das referências não pode exceder o bruto. Referências desconhecidas são rejeitadas pelo motor.

### Exemplo verificável

Bruto **R$ 1.000,00**, quatro unidades de DEMO-A, PIX marcado:

| Parcela | Economia |
|---|---:|
| Progressivo nas quatro unidades | R$ 24,00 |
| PIX de 5% no restante de R$ 712,00 | R$ 35,60 |
| Economia do cenário PIX | **R$ 59,60** |
| Total final PIX | **R$ 940,40** |
| Economia normal | R$ 24,00 |
| Total final normal | R$ 976,00 |

PIX vence. Desmarcá-lo aplica o cenário normal.

## Arquitetura e privacidade

HTML, CSS e JavaScript sem framework ou dependências de execução. `calculator.js` contém o motor independente do DOM; `app.js` lê o formulário; `theme.js` mantém apenas a preferência visual em `demo-commercial-theme`. Pedidos ficam em memória e são descartados ao recarregar. Sem backend, banco, analytics ou integrações comerciais. O registro opcional `read_discount_comparison` permite leitura no navegador que disponibilize `document.modelContext.registerTool`.

A identidade azul e o símbolo `assets/demo-mark.svg` são genéricos. O catálogo é código confiável distribuído junto com a aplicação, não entrada externa.

## Testes

Com Node.js e Microsoft Edge instalados:

```sh
npm install
npm test
```

Playwright é usado apenas nos testes de interface. As suítes de cálculo podem rodar sem instalar pacotes:

```sh
node tests/calculator.test.cjs
node tests/audit.test.cjs
```

A suíte cobre entradas inválidas, limites de faixas, progressivo, PIX marcado/desmarcado, desempates, conservação dos totais e uma matriz comparada com cálculo independente. A UI verifica resultados, erro e recuperação, teclado, persistência de tema e ausência de rolagem horizontal em 1440, 390 e 320 px nos dois temas. `audit.test.cjs` audita cálculos; não é scanner de segredos. Não há medição de cobertura ou workflow CI configurado.

## Docker

Com Docker e Compose instalados:

```sh
docker compose up --build -d
```

Abra [localhost:8081](http://localhost:8081). Encerre com `docker compose down`. Nginx serve os mesmos arquivos estáticos, sem build da aplicação. A imagem e seu contexto incluem somente os arquivos de execução autorizados. Configuração Docker preservada; execução do container não validada nesta atualização porque Docker não está disponível no ambiente de testes.

## Publicação

Repositório: [calculadora-comercial-publica](https://github.com/leviroiz/calculadora-comercial-publica), branch `main`. URL de aplicação hospedada ainda não confirmada. Não há configuração de deploy versionada.

## Autor e licença

Projeto por **Carlos Levi** — [GitHub](https://github.com/leviroiz). Licença a definir: o repositório não contém `LICENSE`.
