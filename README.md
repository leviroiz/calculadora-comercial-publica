# Calculadora Comercial | O melhor desconto por item

Simulador de pedidos que compara preços por volume com faixas de fidelidade e seleciona a condição mais vantajosa para cada item, sem acumular descontos na mesma linha.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

**Demo online:** endereço a adicionar após confirmar a publicação. Por enquanto, siga as instruções de execução local abaixo.

> **Sobre a versão pública**
>
> Projeto inspirado em uma necessidade real de operação comercial e adaptado para portfólio. Produtos, códigos, preços, faixas e percentuais são fictícios. Esta demonstração não tem vínculo com uma empresa e não oferece condições válidas para venda. O código público utiliza identidade genérica, sem integrações ou dados operacionais internos.

## Contexto do problema

Ao montar um pedido, duas condições podem competir: o desconto relacionado ao valor total da compra e o preço progressivo obtido pela quantidade de um produto. Comparar apenas os totais de cada modalidade pode deixar de aproveitar a melhor combinação.

A calculadora torna essa decisão explícita: mostra qual regra cada item recebe, quanto o pedido economiza e quanto falta para alcançar a próxima faixa de fidelidade.

## Solução e experiência

O usuário adiciona os itens e acompanha o recálculo conforme preenche o pedido. A interface apresenta:

- valor bruto, total final e economia do pedido;
- regra aplicada, preço unitário final, economia e total de cada linha;
- cenários isolados de Progressivo e Fidelidade para conferência;
- economia adicional da seleção por item sobre o melhor cenário isolado;
- valor restante para a próxima faixa de fidelidade;
- validação de entradas e orientação quando o pedido está incompleto;
- layout responsivo e temas claro e escuro, com preferência salva localmente.

## Como a lógica funciona

1. **Identificar os itens.** Códigos do catálogo preenchem e bloqueiam o preço base na interface. Outros produtos usam o preço informado.
2. **Calcular o bruto.** Somar preço base × quantidade de todas as linhas, antes dos descontos.
3. **Definir Fidelidade.** Selecionar a maior faixa atingida pelo valor bruto do pedido.
4. **Definir Progressivo.** Somar as quantidades de um mesmo código, mesmo em linhas diferentes, e selecionar a faixa de volume correspondente.
5. **Comparar por item.** Escolher o menor preço unitário entre as duas condições. Elas podem coexistir no pedido, mas não se acumulam na mesma linha.
6. **Consolidar.** Somar os totais finais e apresentar a economia e os cenários de comparação.

### Catálogo e condições fictícias

| Código | Produto | Preço base | A partir de 4 unidades | A partir de 8 unidades |
|---|---|---:|---:|---:|
| DEMO-A | Caderno criativo | R$ 72,00 | R$ 66,00 | R$ 60,00 |
| DEMO-B | Estojo modular | R$ 48,00 | R$ 45,00 | R$ 42,00 |
| DEMO-C | Organizador de mesa | R$ 48,00 | R$ 45,00 | R$ 42,00 |
| DEMO-D | Bloco de notas | R$ 32,00 | R$ 30,00 | R$ 28,00 |

| Total bruto do pedido | Fidelidade |
|---|---:|
| Abaixo de R$ 1.500,00 | 0% |
| De R$ 1.500,00 até menos de R$ 3.000,00 | 5% |
| De R$ 3.000,00 até menos de R$ 5.000,00 | 10% |
| A partir de R$ 5.000,00 | 18% |

Essas condições estão em [`rules.js`](rules.js) e existem exclusivamente para demonstrar o comportamento da aplicação.

### Convenções que afetam o resultado

- Os códigos são comparados exatamente, incluindo maiúsculas e minúsculas, após remover espaços externos. Digite `DEMO-A` para usar seu cadastro; o nome do produto não funciona como alias.
- Produtos fora do catálogo participam da Fidelidade e permanecem com o preço base no cenário Progressivo.
- A comparação usa o preço unitário antes do arredondamento. Em empate, a regra escolhida é Fidelidade, inclusive quando a taxa é 0%.
- Valores base são representados em centavos. Na Fidelidade, o desconto é arredondado por linha; o total do pedido soma essas linhas. Dividir um item entre linhas pode alterar centavos.
- O preço unitário final é exibido com até quatro casas decimais. O total da linha segue a regra de arredondamento acima.
- Preços livres aceitam vírgula ou ponto decimal, até duas casas e nenhum separador de milhar. Quantidades devem ser inteiras entre 1 e 100.000.
- O código limita o preço livre a R$ 1.000.000,00 e o bruto do pedido a R$ 1 bilhão. Frete não participa do cálculo.

## O que explorar

### Uma combinação que supera os cenários isolados

Adicione `DEMO-A`, quantidade **10**, e um produto livre chamado `Item exemplo`, quantidade **10**, preço **78,00**.

| Resultado | Valor |
|---|---:|
| Bruto | R$ 1.500,00 |
| Apenas Progressivo | R$ 1.380,00 |
| Apenas Fidelidade, a 5% | R$ 1.425,00 |
| Melhor condição por item | **R$ 1.341,00** |
| Economia sobre o bruto | **R$ 159,00** |
| Economia adicional sobre o melhor cenário isolado | R$ 39,00 |

O primeiro item recebe Progressivo; o segundo, Fidelidade. Esse cenário também está nos testes automatizados.

Experimente dividir `DEMO-A` entre duas linhas com 4 e 6 unidades para observar o agrupamento por código. Altere o valor de um produto livre para cruzar os limites da Fidelidade e confira as mudanças de regra. Remova os itens ou preencha um valor inválido para explorar os estados da interface.

## Arquitetura da versão pública

Aplicação estática: regras e cálculos executam no navegador, sem backend, banco de dados ou instalação de dependências para uso.

```text
rules.js — catálogo e faixas fictícias
                  ↓
calculator.js — validação e cálculo independente do DOM
                  ↕
app.js — leitura dos campos e atualização dos resultados
                  ↕
index.html + styles.css — interface responsiva
theme.js — tema do sistema e preferência local
```

Os testes carregam diretamente as regras e o motor de cálculo no Node.js. No Docker, o Nginx serve os mesmos arquivos estáticos; não há etapa de compilação nem serviço de cálculo no servidor.

Há ainda um registro opcional de leitura do pedido, `read_discount_comparison`, quando o navegador disponibiliza `document.modelContext.registerTool`. O uso normal da calculadora independe dessa API.

## Tecnologias

| Camada | Implementação |
|---|---|
| Interface | HTML5, CSS com media queries, JavaScript sem frameworks |
| Interação | APIs nativas do DOM e formatação monetária `pt-BR` |
| Regras | JavaScript, preços base em centavos e cálculo separado da interface |
| Preferência visual | `matchMedia` e `localStorage` |
| Testes | Node.js com `node:assert/strict`, sem bibliotecas adicionais |
| Container | Docker, Docker Compose e imagem `nginx:alpine` |

## Executar localmente

Clone o repositório ou baixe seu conteúdo como ZIP:

```sh
git clone https://github.com/leviroiz/calculadora-comercial-publica.git
cd calculadora-comercial-publica
```

Abra `index.html` em um navegador moderno. Não é necessário instalar pacotes, executar um build ou configurar variáveis de ambiente. Node.js é necessário apenas para executar os testes.

## Executar com Docker

Com Docker e o plugin Docker Compose instalados, execute na raiz do projeto:

```sh
docker compose up --build -d
```

Acesse [a calculadora local](http://localhost:8081).

O Compose publica a porta `80` do container em `127.0.0.1:8081`, acessível na própria máquina. O serviço usa a política `restart: unless-stopped`.

Para consultar os logs e encerrar o ambiente:

```sh
docker compose logs
docker compose down
```

O `Dockerfile` copia somente os arquivos necessários à aplicação. O `.dockerignore` também restringe o contexto aos arquivos de execução. A configuração entregue não inclui domínio, HTTPS ou proxy para publicação na internet.

## Testes e qualidade

Na raiz do projeto, com Node.js instalado:

```sh
node tests/calculator.test.cjs
node tests/audit.test.cjs
```

As duas suítes cobrem **286 verificações**: 57 no arquivo principal e 229 no complementar. Os cenários incluem limites de faixas, coexistência de descontos, agrupamento, empate, arredondamento por linha, pedido vazio, entradas inválidas e limites numéricos.

Apesar do nome, `audit.test.cjs` é uma suíte complementar de cálculo e validação de entradas; não é um scanner de segredos ou uma auditoria de privacidade.

O repositório não possui workflows de CI ou deploy, testes automatizados de interface nem medição de cobertura configurada. Os badges acima identificam tecnologias, não status de pipeline. Os testes de cálculo não comprovam execução do container ou comportamento visual no navegador.

## Segurança e privacidade

- O catálogo distribuído contém somente produtos e condições fictícios, com símbolo visual genérico.
- Os itens do pedido permanecem em memória e são perdidos ao recarregar a página. Somente o tema é salvo no `localStorage`, na chave `demo-commercial-theme`.
- A aplicação não implementa autenticação, banco de dados, analytics ou envio do pedido a uma API. O registro opcional de leitura permite consultar o pedido no ambiente que ofereça essa integração do navegador.
- Resultados e mensagens usam `textContent`; o `innerHTML` usado para criar linhas contém uma estrutura fixa com identificadores gerados pelo código.
- A execução da aplicação usa arquivos locais. As imagens dos badges deste README são servidas por um serviço externo de apresentação.

Esta é uma simulação de portfólio. Para uso comercial real, regras e validações precisariam ser avaliadas e protegidas no servidor. A preparação de futuras publicações deve manter dados sintéticos também em exemplos, imagens e documentação.

## Decisões de produto

**Explicar a escolha.** Exibir a regra por item e os cenários isolados permite conferir o resultado sem esconder a comparação atrás de um único total.

**Evitar acúmulo ambíguo.** Cada linha recebe uma condição, com critério de empate e arredondamento definidos no motor de cálculo.

**Reduzir a barreira de exploração.** A versão estática abre diretamente no navegador e mantém Docker como alternativa de execução.

**Separar demonstração de operação.** Catálogo fictício e ausência de persistência mantêm o foco na lógica e na experiência. O projeto não é apresentado como um sistema de vendas em produção.

## O que este projeto demonstra

- Tradução de uma necessidade comercial em regras explícitas e verificáveis.
- Separação entre dados, lógica de negócio e apresentação.
- Tratamento de valores monetários, limites e casos de borda.
- Desenvolvimento de interface responsiva com feedback por item e preferência visual.
- Testes automatizados sem dependências adicionais e empacotamento estático com Docker.
- Preparação de um projeto de portfólio com dados fictícios e documentação transparente sobre seu alcance.

## Estrutura principal

```text
calculadora-comercial-publica/
├── assets/
│   └── demo-mark.svg
├── tests/
│   ├── calculator.test.cjs
│   └── audit.test.cjs
├── index.html
├── styles.css
├── rules.js
├── calculator.js
├── app.js
├── theme.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── README.md
```

## Próximos passos

Possíveis evoluções, ainda não implementadas:

- Confirmar a hospedagem da demo e incluir seu endereço neste README.
- Configurar CI para executar os testes e uma verificação específica de sanitização.
- Adicionar testes de interface e capturas de tela com cenários fictícios.
- Definir uma licença e adicionar o respectivo arquivo ao repositório.

## Autor

Projeto e implementação por **Carlos Levi**.

[GitHub](https://github.com/leviroiz) · [LinkedIn](https://www.linkedin.com/in/leviroiz)

## Licença

Este repositório ainda não contém um arquivo `LICENSE`. A licença de distribuição e reutilização está **a definir**; nenhuma licença MIT ou equivalente é declarada nesta documentação.
