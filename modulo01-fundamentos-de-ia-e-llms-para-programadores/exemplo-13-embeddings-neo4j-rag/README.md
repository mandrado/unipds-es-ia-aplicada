# Criando o primeiro RAG com JavaScript e Neo4j

Apresenta-se como criar um projeto completo de RAG utilizando JavaScript e Neo4j. A proposta é transformar uma transcrição de aula em uma base consultável, capaz de responder perguntas com base em busca por similaridade, antes mesmo de usar modelos generativos.
Inicia-se o projeto com a leitura e preparação do conteúdo em formato PDF. A transcrição é dividida em pedaços coerentes, chamados de chunks, cada um representando um trecho com sentido completo. Em seguida, utiliza-se a biblioteca transformer.js para gerar os embeddings localmente. Isso significa que não há dependência de serviços externos, chaves de API ou infraestrutura pesada — tudo executado localmente, de forma leve e eficiente.
Esses embeddings, que são vetores numéricos representando o significado de cada chunk, são armazenados em um banco vetorial dentro do Neo4j. Cada chunk fica associado a metadados como o minuto da aula, o nome do arquivo e a posição no texto. Isso traz não apenas contexto, mas também a possibilidade de organizar e refinar as buscas posteriormente.
Na segunda fase do projeto, implementa-se uma etapa de consulta por similaridade. O sistema converte as perguntas em embeddings, compara com os armazenados no Neo4j e retorna os trechos mais próximos. Essa etapa permite criar um sistema de memória não paramétrica, fundamental para o funcionamento do RAG, garantindo que o modelo receba sempre o contexto certo antes de gerar qualquer resposta.
A construção dessa base deixa claro o quanto a engenharia de dados é essencial para IA. O modelo só é bom quando alimentado com dados relevantes e bem estruturados. O controle sobre os embeddings, sobre os metadados e sobre a forma como os trechos são indexados fornece autonomia para criar uma arquitetura de IA verdadeiramente útil.
Finaliza-se este capítulo com a certeza de que dominar esse tipo de projeto é o passo mais importante para qualquer desenvolvedor que queira levar IA a sério. Com esse tipo de estrutura, é possível alimentar modelos com conhecimento real, atualizado e alinhado ao domínio específico. E o melhor: sem depender de soluções prontas ou fechadas.

## Instrucoes de Execucao do Projeto

Cria-se o arquivo `.env` a partir do modelo `.env-template`, com o preenchimento das variaveis necessarias.

Instalam-se as dependencias do projeto:

```bash
npm install
```

Antes de iniciar o projeto, garante-se que o Docker esteja em execucao e executam-se os comandos:

```bash
npm run infra:up
npm run start
```

Aguarda-se a inicializacao do Neo4j e valida-se no navegador em http://localhost:7474/browser/ se a base ainda esta vazia.

A senha de conexao com o banco de dados fica no arquivo `.env`. Recomenda-se alterar a senha no ambiente local para um valor seguro.

### Processamento do Documento

O arquivo `./tensores.pdf` e processado pela pipeline definida em `./src/DocumentProcessor.ts` e `./src/index.ts`.

Executa-se o comando:

```bash
npm run dev
```

## Encerrando
Rode o comando:
```bash
npm run infra:down
```

## O que foi implementado nesta etapa

...
