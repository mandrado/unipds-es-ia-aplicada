## O que são Embeddings e Vector Databases
Quando falamos de inteligência artificial hoje em dia, a primeira imagem que surge na mente da maioria das pessoas é a de um chatbot respondendo perguntas de forma articulada. No entanto, por trás dessa interface interativa e sofisticada, existe um componente muito mais fundamental e menos glamouroso: os embeddings e a busca por similaridade. Esses são os verdadeiros motores que tornam as soluções de IA realmente úteis e relevantes para os usuários.
Neste capítulo, apresenta-se de maneira prática como isso funciona. A proposta é apresentar a mecânica que sustenta o funcionamento de sistemas de IA, sem truques ou aparências polidas, e sem a interferência de modelos generativos. Explora-se o conceito de embeddings, como eles são gerados, armazenados e utilizados em buscas por similaridade dentro de um banco de dados vetorial, utilizando o Neo4j.

## Entendendo Busca por Similaridade
Diferente do comando Ctrl+F usado para encontrar palavras exatas em documentos, a busca por similaridade trabalha com o sentido e não com a forma literal das palavras. Ao transformar trechos de texto em vetores (os embeddings), é possível identificar similaridades sem depender de palavras idênticas. Dois textos com significados parecidos, mesmo que escritos com palavras distintas, são representados por vetores próximos no espaço vetorial.
Imagine que você quer saber o que é backpropagation, ou como uma rede neural ajusta os pesos, ou ainda como funciona um gradiente descendente. Mesmo que esses termos específicos não estejam na transcrição de uma aula, um sistema baseado em embeddings é capaz de encontrar trechos relevantes onde esses conceitos são explicados com outras palavras.
Embeddings são representações numéricas que codificam o significado de um texto. Eles podem ser imaginados como um mapa em que ideias semelhantes estão geograficamente próximas. Quando uma consulta é realizada, o sistema executa os cálculos matemáticos para determinar quais vetores estão mais próximos do vetor da consulta.

## O Papel do Neo4j como Banco Vetorial
Apesar de ser conhecido como um banco de dados de grafos, o Neo4j também funciona excelentemente como um vector database. Nele, armazenamos os pedaços de texto (chunks) como nós do grafo, e os embeddings como propriedades desses nós. Criamos um índice vetorial que permite consultas por similaridade, retornando os trechos mais relevantes de acordo com a proximidade dos vetores.
Uma das vantagens desse tipo de abordagem é a possibilidade de enriquecer os dados. Cada chunk pode ter metadados associados, como o título da aula, a seção, o minuto do vídeo e outros. Isso possibilita consultas mais estáveis e resultados com maior contextualização.

## Geração Local de Embeddings
Para essa experiência, utiliza-se a biblioteca Transformer.js para gerar os embeddings localmente. Isso significa que é possível fazer tudo sem depender de chaves de API, sem usar Docker e sem sobrecarregar a máquina. Tudo funciona em Node.js puro.

O fluxo é simples: uma transcrição de aula em PDF é processada, quebrada em pedaços menores (chunks), tem seus embeddings gerados e esses dados são armazenados no Neo4j. Em seguida, é possível realizar perguntas e visualizar os trechos mais semelhantes com base apenas na similaridade vetorial. É o puro funcionamento do mecanismo de RAG (Retrieval-Augmented Generation), mas sem a parte de "generation" ainda.

## Da Teoria à Prática
Durante a prática, utiliza-se um exemplo com uma transcrição de aula sobre tensores. O arquivo PDF é processado e, através de uma pipeline local, o texto é transformado em chunks e os embeddings são gerados para cada um. Cada trecho é indexado no Neo4j com metadados. Em seguida, executam-se consultas como "o que é one hot encoding?" ou "como treinar uma rede neural?". Mesmo sem essas frases exatas na transcrição, o sistema é capaz de retornar parágrafos altamente relevantes.
Esse processo deixa claro que a busca por similaridade é um componente essencial para a IA moderna. Antes mesmo de um modelo generativo responder algo, ele precisa de um contexto relevante, e esse contexto é fornecido por um mecanismo como esse.

## Conclusão
A compreensão profunda de embeddings e vector databases é vital para qualquer desenvolvedor que deseje trabalhar com sistemas de IA mais robustos e confiáveis. Eles são a espinha dorsal das aplicações baseadas em RAG e são o elo entre o armazenamento eficiente e a inteligência contextual das respostas. No próximo capítulo, conecta-se esse mecanismo de embeddings com um modelo de linguagem para realizar respostas completas, fechando o ciclo do RAG com geração de linguagem natural.


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

## Adendo (Atualizacao apos o ultimo commit)

Foi identificada e corrigida uma inconsistência nas variaveis de ambiente do Neo4j:

- O codigo utilizava `NEO4J_USER`.
- O modelo `.env-template` estava com `NEO4J_USERNAME`.

Essa divergencia causava erro de autenticacao no Neo4j (`Unsupported authentication token, missing key principal`), pois o usuario nao era carregado corretamente.

Padrao adotado no projeto:

- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `NEO4J_URI`
- `NEO4J_DATABASE`

Com isso, o fluxo de inicializacao e processamento volta a funcionar de forma consistente quando o `.env` e preenchido conforme o modelo.

## Encerrando
Rode o comando:
```bash
npm run infra:down
```

## O que foi implementado nesta etapa

O objetivo desta etapa foi demonstrar o núcleo de um sistema de RAG sem a camada de geração de linguagem: apenas a indexação e a recuperação por similaridade.

O ponto de partida é um documento PDF — neste caso, uma transcrição de aula sobre tensores. Esse documento é carregado pelo `DocumentProcessor.ts` e dividido em múltiplos fragmentos menores, chamados de **chunks**. Cada chunk é um trecho de texto de tamanho controlado, com uma sobreposição configurável entre fragmentos consecutivos para evitar a perda de contexto nas bordas.

Cada chunk é então convertido em um **embedding**: um vetor numérico de alta dimensão que representa semanticamente o significado daquele trecho. A geração dos embeddings é feita localmente, utilizando o modelo `Xenova/all-MiniLM-L6-v2` via Transformer.js, sem dependência de APIs externas.

Os vetores gerados são armazenados no **Neo4j** como propriedades de nós do tipo `Chunk`. Um índice vetorial é criado sobre esses nós, permitindo que o banco de dados realize buscas por similaridade de forma eficiente.

Ao realizar uma pergunta — por exemplo, "o que é one hot encoding?" — a consulta também é convertida em um embedding. O Neo4j então compara esse vetor com todos os vetores armazenados e retorna os chunks cujo significado é matematicamente mais próximo da pergunta. Não é uma busca por palavras exatas: é uma busca por **proximidade semântica**.

O resultado é que, mesmo que a pergunta use palavras diferentes das que aparecem no documento, o sistema é capaz de recuperar os trechos mais relevantes. Esse mecanismo de recuperação é exatamente o "R" (Retrieval) no acrônimo RAG.


