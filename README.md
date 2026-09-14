# Calculadora Comercial — portfólio

Projeto inspirado em uma necessidade real de operação comercial. Todos os produtos, códigos, valores, faixas e percentuais desta versão são fictícios e foram adaptados para fins de portfólio. Esta é uma demonstração, sem vínculo com uma empresa e sem condições comerciais válidas para venda.

Aplicação em HTML, CSS e JavaScript puro que compara descontos por volume com um programa de fidelidade e aplica a melhor condição a cada item, sem acumular descontos. Interface responsiva com temas claro e escuro, sem dependências de execução, banco ou integrações comerciais.

## Dados demonstrativos

| Código | Produto fictício | Base | 4 ou mais | 8 ou mais |
|---|---|---:|---:|---:|
| DEMO-A | Caderno criativo | R$ 72,00 | R$ 66,00 | R$ 60,00 |
| DEMO-B | Estojo modular | R$ 48,00 | R$ 45,00 | R$ 42,00 |
| DEMO-C | Organizador de mesa | R$ 48,00 | R$ 45,00 | R$ 42,00 |
| DEMO-D | Bloco de notas | R$ 32,00 | R$ 30,00 | R$ 28,00 |

Fidelidade sobre o total bruto: 5% a partir de R$ 1.500,00; 10% a partir de R$ 3.000,00; 18% a partir de R$ 5.000,00. Essas condições foram criadas apenas para a demonstração.

## Como executar

Abra `index.html` no navegador. Para os testes, instale Node.js e execute na raiz:

```sh
node tests/calculator.test.cjs
node tests/audit.test.cjs
```

Com Docker e Compose instalados:

```sh
docker compose up --build -d
```

Acesse `http://localhost:8081`. Para encerrar: `docker compose down`. A porta está vinculada ao endereço local; exposição pública exige configuração própria de hospedagem.

## Arquitetura e convenções

- `rules.js`: catálogo fictício e regras em centavos.
- `calculator.js`: cálculo independente da interface.
- `app.js` e `index.html`: interação, validação e apresentação dos cenários.
- `styles.css` e `theme.js`: aparência responsiva, acessibilidade do botão e preferência de tema.
- `assets/demo-mark.svg`: símbolo genérico da demonstração.
- `tests/`: limites de faixas, coexistência, agrupamento, empate, arredondamento e entradas inválidas.
- `Dockerfile`, `.dockerignore` e `docker-compose.yml`: execução estática com Nginx e lista explícita dos arquivos da imagem.

Códigos são comparados exatamente após remover espaços externos. Produtos cadastrados preenchem e bloqueiam o preço base. Outros produtos usam o preço informado. Quantidades do mesmo código são agrupadas. A comparação usa preços exatos antes do arredondamento; empates preferem Fidelidade. A economia da Fidelidade é arredondada por linha, e o total soma as linhas; separar linhas pode mudar centavos. Unitários são exibidos com até quatro casas. Frete não entra no cálculo.

Os itens permanecem somente em memória. Apenas o tema é salvo no armazenamento local, na chave `demo-commercial-theme`; sem preferência, acompanha o sistema.

Exemplo: DEMO-A, quantidade 10, mais um produto livre com quantidade 10 e preço R$ 78,00. Bruto: R$ 1.500,00; total: R$ 1.341,00; economia: R$ 159,00. A primeira linha recebe Progressivo e a segunda Fidelidade.

## Publicação

Esta edição começa em um novo repositório Git, sem histórico anterior. Crie um repositório público vazio na sua conta e substitua `SEU_USUARIO` nos comandos:

```sh
git remote add origin https://github.com/SEU_USUARIO/calculadora-comercial-publica.git
git push -u origin main
```

O endereço é um modelo, não um remoto já criado. Não há credenciais ou configurações de produção neste projeto.
