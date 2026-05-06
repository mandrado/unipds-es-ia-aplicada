# Módulo 2: Langchain.js - Introdução

## informações iniciais

- site: https://www.langchain.com/
- docs langchain: https://docs.langchain.com/oss/javascript/langchain/overview
- docs langgraph: https://docs.langchain.com/oss/javascript/langgraph/overview

Comandos:

```pwsh
cd .\modulo02-integracao-apis-llms\02-langchain-intro\
npm init -y
npm install fastify@5.7.4 @types/node@24
npm install @langchain/core@1.1.44 langchain@1.2.17
```

Criar uma aplicação de exemplo

```pwshl
npx @langchain/langgraph-cli new
cd .\myapp\
touch .env
npx @langchain/langgraph-cli@latest dev
```

Copiar o arquivo `langgraph.json` para a raiz do projeto.
Excluir a aplicação de exemplo

```pwsh
cd ..
Remove-Item -Recurse -Force .\myapp\
```

## Capítulo 1: Introdução ao Langchain.js - pipes, fluxos condicionais e gerador de apps

No módulo anterior você já teve contato com o LangChain na prática, inclusive criando um RAG utilizando Neo4j, JavaScript e a própria biblioteca. Agora a gente começa uma nova etapa. A partir daqui, eu quero usar muito mais TypeScript e Node.js para estruturar agentes de IA de forma mais profissional, organizada e preparada para produção.
Nesta aula eu não vou focar em IA propriamente dita. Eu quero que você entenda o mecanismo da ferramenta. Quero que você compreenda por que o nome é “chain”, como funcionam pipes, como podemos criar fluxos condicionais e como o próprio ecossistema fornece um gerador de aplicações para acelerar o início do projeto. A ideia é construir base conceitual sólida para que, nas próximas aulas, você reutilize esse entendimento ao criar agentes mais complexos.
O LangChain é um framework open source, extremamente popular também no ecossistema Python. A versão para TypeScript e JavaScript evoluiu bastante, e hoje já permite estruturar agentes, grafos, fluxos de decisão e integrações com modelos de maneira bastante organizada. Ele também possui uma camada chamada LangSmith, que funciona como ambiente de observabilidade e depuração em nuvem.
Eu gosto muito do LangSmith porque ele permite visualizar exatamente quais ferramentas foram chamadas, quais passos foram executados e como o fluxo foi percorrido até chegar ao resultado final. Isso é essencial quando você começa a trabalhar com agentes que tomam decisões, chamam múltiplas funções e executam fluxos não triviais.
Apesar de existir uma oferta de nuvem paga para deploy e monitoramento avançado, você não precisa pagar nada para desenvolver suas aplicações com LangChain. A biblioteca é open source, e o ambiente de tracing básico já entrega bastante valor mesmo no plano gratuito.
A primeira coisa que eu faço é criar uma API Key dentro do LangSmith. Isso segue a mesma lógica que utilizamos com OpenRouter. Eu entro nas configurações, crio uma chave com nome específico para o projeto e copio esse valor para usar como variável de ambiente. Eu recomendo fortemente que você adote o hábito de criar chaves com validade limitada ou rotacionáveis. Segurança não é detalhe, é disciplina.
Depois disso, eu organizo o projeto no VSCode. Eu crio uma nova pasta para este módulo, inicializo com npm init e garanto que estou usando Node.js 24. Essa escolha não é aleatória. A versão mais recente do Node permite executar TypeScript com stripping de tipos, o que simplifica bastante o setup inicial. Eu quero reduzir fricção para que você foque no entendimento de fluxo, não em configuração de build.
Eu crio o arquivo .env e adiciono a variável LANGCHAIN_API_KEY com o valor gerado. Também adiciono a variável que ativa tracing, normalmente algo como LANGCHAIN_TRACING_V2=true, além de um nome para o projeto. Esse nome ajuda a identificar o projeto dentro do LangSmith quando começarmos a visualizar execuções.
Em seguida, eu instalo as dependências necessárias. Aqui é importante prestar atenção nas versões. A biblioteca está evoluindo rapidamente, e templates oficiais nem sempre estão alinhados com a versão mais recente. Eu já encontrei situações em que o template gerado pelo CLI estava usando uma versão beta antiga, enquanto a versão estável já estava na série 1.x.
Isso é um ponto importante: quando você está construindo algo com intenção de colocar em produção, você precisa controlar versões. Não confie cegamente no template gerado. Sempre verifique se a versão instalada é a mesma que você está estudando ou utilizando como referência.
O CLI do LangChain permite gerar um projeto base. Ao rodar o comando apropriado, ele cria um boilerplate com estrutura de grafo, testes e integração inicial. Quando você executa o projeto, ele sobe uma interface web que permite visualizar o grafo de execução. Esse grafo representa o encadeamento de funções.
E aqui entra o conceito central: por que “chain”?
Chain significa encadeamento. A ideia fundamental do LangChain é que você compõe funções, transformações e chamadas de modelo em sequência. Cada etapa recebe um input, processa e passa adiante. Esse encadeamento pode ser linear ou pode formar grafos mais complexos com bifurcações e condições.
Um pipe é basicamente uma composição de etapas. Você pode pensar como um fluxo funcional: entrada → transformação → chamada de modelo → pós-processamento → saída. Cada etapa é previsível, testável e isolável. Isso é extremamente poderoso quando você quer manter organização.
Quando começamos a trabalhar com fluxos condicionais, o jogo muda um pouco. Em vez de sempre seguir uma única sequência fixa, o grafo pode tomar decisões. Por exemplo, se a pergunta do usuário for sobre determinado assunto, você pode direcionar para um conjunto específico de ferramentas. Se for sobre outro assunto, você pode chamar outra cadeia.
Essa lógica de decisão não precisa estar espalhada pelo código. O LangChain permite estruturar isso declarativamente dentro do grafo. Você define nós, define conexões e pode condicionar o caminho com base em estado ou saída anterior.
O visualizador do LangSmith ajuda muito a entender isso. Ao executar uma interação, você consegue ver exatamente qual nó foi chamado, qual ferramenta foi acionada, qual foi o prompt enviado ao modelo e qual resposta foi recebida. Para quem está desenvolvendo agentes, isso é quase obrigatório. Sem observabilidade, você fica no escuro.
Outro ponto interessante é que o projeto gerado já vem com uma estrutura de grafo definida em um arquivo específico. Esse arquivo declara qual função exportada representa o grafo principal. É por meio dessa exportação que o CLI consegue carregar o fluxo e exibir na interface visual.
Se essa exportação estiver errada, o CLI não consegue encontrar o grafo. Esse detalhe pode parecer pequeno, mas é fundamental para que o ambiente de depuração funcione corretamente.
Uma coisa que eu faço questão de destacar é que eu não utilizo cegamente tudo que o template gera. Muitas vezes ele inclui dependências que não são necessárias, como frameworks de teste adicionais, mesmo quando o Node já possui test runner nativo. Eu prefiro manter o projeto enxuto e adicionar apenas o que realmente preciso.
O objetivo aqui não é criar aplicação complexa ainda. É entender como o fluxo funciona.
Quando você executa o projeto e abre a interface web, você pode testar interações diretamente ali, sem precisar desenvolver frontend próprio. Isso acelera muito o ciclo de experimentação. Você envia uma mensagem, observa a execução no grafo, vê o estado interno e entende como os dados estão sendo transformados.
Isso nos prepara para trabalhar com algo ainda mais interessante: gerador de apps e composição de agentes.
O gerador de apps é basicamente um ponto de partida. Ele cria estrutura inicial para você não precisar começar do zero. Mas a verdadeira força está na capacidade de compor nós personalizados.
Cada nó pode ser uma função sua. Pode ser uma chamada de API. Pode ser uma consulta a banco de dados. Pode ser um classificador que decide qual caminho seguir. Pode ser uma chamada para um modelo específico. Tudo isso pode ser encadeado.
E aqui está o diferencial em relação a simplesmente chamar uma API de LLM dentro de um controller de API: você está declarando fluxo explicitamente. Você está estruturando pipeline com responsabilidade clara.
Isso facilita testes. Facilita manutenção. Facilita troca de modelo. Facilita inserir etapa intermediária de validação ou sanitização. Facilita medir performance de cada etapa individualmente.
No contexto de engenharia de software aplicada à IA, isso é ouro.
Você deixa de ter um código monolítico que recebe pergunta e devolve resposta. Você passa a ter uma máquina de estados organizada, com etapas definidas e observáveis.
A partir dessa base, nas próximas aulas, nós vamos começar a inserir IA de verdade nos nós. Vamos conectar modelos, criar fluxos mais inteligentes, adicionar memória, adicionar ferramentas e evoluir para agentes capazes de executar ações.
Mas sem entender pipes, encadeamento e grafos, você estaria apenas copiando código sem compreender o que está acontecendo.
E o meu objetivo aqui não é que você copie. É que você domine.
Porque quando você entende como encadear funções, como estruturar fluxo condicional e como observar execução, você não depende de template. Você começa a desenhar seus próprios agentes com intenção arquitetural clara.
Esse é o passo que diferencia alguém que “usa biblioteca” de alguém que constrói sistemas com biblioteca.
E é exatamente esse tipo de profissional que o mercado está procurando quando fala em engenharia de IA aplicada.

## Capítulo 2: Gerenciando estados em fluxos, usando Langgraph Studio, expondo o projeto como Web API

Nesta aula eu quero consolidar o que a gente começou na introdução do LangChain e, principalmente, do LangGraph. Aqui a minha intenção é te colocar numa mentalidade bem clara: quando você constrói fluxo com grafo, você não está apenas “orquestrando funções”. Você está gerenciando estado de aplicação. E, se você fizer isso direito, você ganha previsibilidade, depuração e a possibilidade de expor o fluxo como produto via Web API.
Eu começo limpando a bagunça do template. Eu mostrei o gerador de app porque ele é útil para visualizar o ambiente e entender a dinâmica do Studio, mas eu não gosto de adotar o boilerplate inteiro. Então eu faço o que precisa ser feito: eu removo o subprojeto gerado e mantenho apenas o que me interessa como referência, principalmente o arquivo de configuração do grafo, porque ele dita como o Studio vai localizar o fluxo exportado.
Com o projeto limpo, eu vou reaproveitar a estrutura de src e a estratégia de testes do que eu já vinha construindo antes. Eu não quero recomeçar do zero toda vez. Eu quero manter o projeto evoluindo com disciplina. Então eu trago o mínimo necessário para o projeto rodar, mantendo a API simples e o teste mais simples ainda, só para garantir que o ambiente está saudável.
Nesse momento eu bato em um detalhe que muita gente esquece e que vira erro bobo: se você está usando imports no Node, você precisa configurar o projeto como módulo. Mesmo usando TypeScript, se o runtime é o Node rodando direto, você precisa garantir que o package.json está como type module. Se você não faz isso, os imports quebram e você perde tempo com algo que não tem nada a ver com o objetivo da aula.
Eu valido isso rodando os testes no terminal de debug do VS Code. Eu uso o JavaScript Debug Terminal justamente para reaproveitar o processo com inspect e ter depuração pronta. Eu gosto dessa abordagem porque me permite colocar breakpoint e entender execução com controle, sem viver no console.log.
Com o projeto ok, eu passo para a parte central da aula: o grafo precisa de estado. E o estado não é um detalhe. É o que conecta os nós.
Eu crio uma pasta específica para graph, e dentro dela eu começo a organizar as peças como eu quero que você pense. Eu separo o que é “nó”, o que é “construção do grafo” e o que é “exportação do grafo” para o Studio.
A primeira decisão é definir o shape do estado. Eu preciso escolher o que vai existir no estado para que cada nó possa ler e escrever sem acoplamento desnecessário. E aqui entra um ponto importante: para o LangGraph Studio exibir corretamente a aba de chat, na versão atual que estamos usando, eu preciso declarar um campo de mensagens com o formato esperado.
Como eu estava trabalhando com a versão 1.x do LangChain e do LangGraph, eu encontrei um comportamento ruim em que o chat do Studio não funcionava como a documentação mostrava. Eu sigo então a estratégia que vi na issue do repositório: eu modelo o estado usando Zod, com a tipagem de mensagens do LangGraph, para garantir que o Studio entenda corretamente o que entra e o que sai.
Esse estado, para a nossa aula, tem três elementos centrais.
O primeiro é messages, que representa o histórico de mensagens. Mesmo que a gente não esteja usando IA ainda, esse campo precisa existir porque o Studio depende dele para a interação do chat.
O segundo é output, que é onde eu vou materializar o resultado final do fluxo. Esse output é o que eu vou devolver pela API.
O terceiro é command, que representa a intenção do usuário. Eu defino esse command como um enum com opções como uppercase, lowercase e unknown. Eu faço isso porque eu quero construir um fluxo condicional. Se o comando for uppercase, eu sigo um caminho. Se for lowercase, sigo outro. Se for unknown, eu posso devolver erro ou adotar uma estratégia padrão.
E aqui está a diferença entre “encadear funções” e “gerenciar fluxo de aplicação”. O command no estado vira a variável de decisão que define o caminho.
Com o estado definido, eu começo a construir o grafo. Eu crio uma função buildGraph que monta um StateGraph com base no schema do estado. E eu já
deixo claro para você uma regra de ouro: o grafo precisa ser compilado no final. Você define nós, define edges, define condições, mas quem materializa o workflow executável é o compile.
A partir daí eu defino os nós. Eu começo com um nó inicial, que eu chamo de identifyIntent. A função dele é simples: ler o que o usuário escreveu e decidir se a intenção é uppercase, lowercase ou unknown. Nesta aula eu não preciso de IA para isso. Eu posso fazer uma regra simples de parsing do texto, porque o objetivo é enxergar o fluxo e validar a mecânica.
O que importa aqui é o padrão. O nó sempre recebe o estado e retorna um estado atualizado. Você pode adicionar propriedades, alterar command, preencher output, adicionar mensagens, mas o contrato é esse. Um nó é uma transformação de estado.
A partir do identifyIntent, eu construo as ramificações. Se o command for uppercase, eu vou para um nó que transforma a mensagem em maiúscula e preenche output. Se o command for lowercase, eu vou para um nó que transforma para minúscula e preenche output. Se for unknown, eu encaminho para um nó de fallback, que devolve uma mensagem padrão ou uma orientação de uso.
E aqui eu faço o fluxo condicional com edges condicionais. Esse é o ponto chave. Eu não estou apenas definindo uma sequência fixa. Eu estou declarando que o caminho depende do estado.
Isso é gerenciamento de estado aplicado a fluxo.
Depois que eu monto o grafo, eu preciso integrar isso com a API. Eu volto para o meu servidor Fastify e faço a rota de chat chamar graph.invoke. O input do invoke precisa respeitar o schema do estado.
Então eu construo o objeto inicial com messages preenchido com uma HumanMessage contendo a pergunta do usuário, e eu deixo command e output vazios ou com default. Eu não tento improvisar. Eu quero que o fluxo sempre comece de forma previsível.
Quando o grafo termina, eu devolvo response.output. Esse output foi definido no estado, preenchido por algum nó terminal. E aí eu já tenho a primeira Web API expondo um fluxo de LangGraph.
Agora entra o Studio.
Para o LangGraph Studio carregar o meu grafo, eu preciso exportar corretamente a função que representa o grafo compilado. E eu preciso que o arquivo de configuração do LangGraph aponte para esse export. Se isso estiver errado, o Studio não acha o grafo, não renderiza a visualização, não habilita o chat.
Então eu copio o lang-graph.json do template e ajusto o path para apontar para o meu arquivo real. Eu crio uma factory dentro de src/graph que constrói e exporta o grafo compilado. O Studio vai ler esse export e montar a interface de visualização.
Quando eu rodo o comando de serve do LangGraph, o Studio sobe no navegador. Eu abro o chat e envio uma mensagem. Mesmo que ainda não tenha IA, eu já consigo ver o nó identifyIntent sendo executado e consigo ver o estado completo em cada etapa. Eu enxergo command, messages e output.
E isso fecha um ciclo fundamental.
Eu não estou tentando adivinhar o que aconteceu. Eu estou observando o que aconteceu.
O tracing visual me mostra quais nós executaram, em que ordem, e qual foi o estado antes e depois. Isso é o que torna LangGraph valioso em projeto de agente. Sem isso, você vira refém de comportamento emergente e debugging difícil.
Para terminar a aula do jeito certo, eu faço a mesma coisa que eu venho insistindo desde o início do módulo: eu coloco teste.
Eu começo pelo teste orientando a implementação. Eu defino um cenário em que o comando deve transformar a mensagem em uppercase. Eu envio um
request para a API com uma frase do tipo “make this message uppercase” e eu espero que o output venha em maiúsculo.
No começo o teste falha, porque a API ainda devolve algo fixo. Eu vou implementando até passar. E eu mantenho o teste simples, porque aqui eu quero validar o fluxo e o contrato.
Esse tipo de teste não precisa ser sofisticado. Ele precisa ser confiável.
Além disso, eu continuo usando o inject do Fastify. Eu não subo porta, eu não dependo de rede, eu executo request em memória. Isso torna o teste rápido e elimina flakiness.
Quando tudo passa, eu fico com três entregas concretas.
Eu tenho um grafo com estado bem definido.
Eu tenho fluxo condicional baseado em command.
Eu tenho um servidor expondo isso como Web API, com teste automatizado validando contrato.
E eu tenho o LangGraph Studio me permitindo depurar visualmente cada etapa do fluxo e validar estado com clareza.
Essa base é o que vai permitir, nas próximas aulas, inserir IA dentro dos nós sem virar bagunça. Quando eu colocar um LLM para identificar intenção, quando eu colocar ferramentas para buscar dados, quando eu colocar memória e múltiplos passos, eu já vou estar em cima de uma arquitetura que trata fluxo como software sério.
E é exatamente isso que eu quero que você leve daqui: agente não é magia. Agente é estado, fluxo e observabilidade.

## Capítulo 3: Criando estrutura inicial de nodes e edges no Langchain

Agora que você já entendeu o processo geral, eu quero montar a estrutura inicial do nosso grafo do jeito que eu gosto de trabalhar, que é evoluindo com clareza e sem improviso. A ideia aqui é criar, de forma explícita, os nossos primeiros nodes e edges, organizar isso em arquivos separados e deixar o LangGraph Studio já enxergando o fluxo, para que a depuração faça parte do desenvolvimento desde o começo.
Eu começo criando o nosso primeiro node real, o identifyIntentNode. Eu não quero deixar lógica no meio do arquivo do grafo, porque isso vira bagunça rápido. Então eu crio um arquivo específico para esse nó e defino uma função identifyIntent que recebe o state, que é sempre o nosso GraphState. Esse state é o contrato do grafo, então eu apenas tipifico e sigo com ele.
Dentro do identifyIntent, a primeira coisa que eu faço é extrair o input do lugar certo. Como o estado tem messages, eu pego sempre a última mensagem. Isso é um padrão importante porque, para fluxo conversacional, o que importa é o que o usuário acabou de dizer, principalmente quando você está no começo e ainda não está usando memória de longo prazo.
Eu garanto que essa leitura é defensiva. Se por alguma razão não existir mensagem, eu sigo com string vazia. Não é porque é aula que eu vou aceitar null e deixar estourar em runtime. O objetivo é você se acostumar a não deixar erro bobo entrar.
Com o input em mãos, eu normalizo para minúsculo e inicializo o command como unknown. Eu quero que o fluxo sempre tenha um valor default, porque o fluxo condicional depende desse campo. A partir daí, eu faço uma detecção simples. Se o texto contiver “upper”, eu defino command como uppercase. Se contiver “lower”, eu defino command como lowercase. Se não contiver nada, ele fica unknown.
Eu estou fazendo isso de propósito de forma simples, porque aqui o objetivo não é “intenção perfeita”, é ver um nó que decide e atualiza estado. Mais para frente, eu posso substituir esse nó por uma chamada de modelo, ou por uma classificação melhor. Mas a estrutura não muda: o nó lê estado, decide, atualiza estado e devolve um novo estado.
No retorno desse nó, eu devolvo o state original junto com o command atualizado e também coloco o output com base no input, só para termos um valor fluindo no começo. Esse output vai ser substituído depois pelos nós de transformação.
Com esse node pronto, eu vou para o grafo e paro de usar a função inline que eu tinha colocado antes. Eu importo o identifyIntentNode e adiciono ele no workflow com addNode usando um nome estável, porque esse nome vai aparecer no Studio e vai ser referência para as edges.
O primeiro objetivo é simples: eu quero que o START vá para identifyIntent e que identifyIntent vá para END. Nesse momento não tem ramificação ainda, eu só quero validar estrutura, exportação e visualização no Studio.
Quando eu volto para o LangGraph Studio e testo no chat, mesmo que a aplicação ainda não “responda” de forma bonita, eu consigo ver o grafo executando e consigo ver o command sendo preenchido corretamente. Se eu mando algo contendo “lower”, o command vira lowercase. Se eu mando algo contendo “upper”, o command vira uppercase. Só isso já prova que o estado está sendo atualizado pelo nó e que o tracing está funcionando.
A partir daí eu crio o segundo node, o chatResponseNode. Esse nó existe por um motivo bem prático: eu quero que o Studio mostre uma mensagem final como AI message no chat, mesmo antes de a gente colocar um modelo de verdade. Isso melhora muito a experiência de teste, porque você enxerga o ciclo completo.
O chatResponseNode recebe o state e usa o state.output como texto de resposta. Eu crio uma AI message com esse texto e adiciono essa mensagem ao array de messages, mantendo as anteriores e anexando a última. Isso é importante para que o Studio renderize corretamente o que aconteceu. Eu não preciso mexer no output aqui, porque ele já foi definido antes. Eu só estou materializando a resposta na forma de mensagem.
Com isso, eu volto ao grafo e adiciono o nó chatResponse. Agora o fluxo passa a ser START → identifyIntent → chatResponse → END. Eu declaro as edges
explicitamente, porque eu quero que você entenda que edges são ordem de execução. Node é função. Edge é conexão.
Isso é exatamente o motivo de chamar chain. Eu estou encadeando passos. A diferença é que, no LangGraph, esse encadeamento pode evoluir para decisões e loops.
Quando eu volto ao Studio e testo no chat, eu já passo a ver resposta aparecendo. Ela ainda é “burra”, porque está apenas devolvendo o output, mas agora eu tenho uma visualização completa do fluxo, com mensagens e estado. Eu consigo ver os nós sendo executados em sequência, e consigo ver o estado antes e depois de cada um.
E aqui eu faço o fechamento do jeito certo: eu garanto que o teste automatizado continua passando.
Eu não quero que o Studio vire meu único mecanismo de validação. Ele é ótimo para depuração e observabilidade, mas contrato de API e evolução de projeto eu valido com teste. Eu ajusto o teste para esperar 200 e, quando eu estiver pronto, eu volto a exigir o comportamento de uppercase e lowercase.
O ponto importante é que, com identifyIntentNode e chatResponseNode separados em arquivos, eu já tenho uma estrutura inicial que escala. Eu não estou colocando tudo em um arquivo só. Eu estou desenhando o grafo como arquitetura.
Daqui, o próximo passo natural é criar os nós de transformação propriamente ditos e, principalmente, trocar o fluxo linear por fluxo condicional baseado no command. Aí a gente vai começar a ver o LangGraph brilhar, porque o grafo vai decidir caminhos diferentes e você vai enxergar isso no Studio com clareza.
Capítulo 4: Criando pipeline completo com fluxos condicionais e testes automatizados
Agora eu vou acelerar, porque você já entendeu a estratégia. O objetivo aqui é transformar aquele fluxo linear em um pipeline completo, com ramificações reais, processamento separado em nós específicos e testes automatizados cobrindo os caminhos principais. É aqui que o LangGraph começa a mostrar valor, porque eu consigo declarar o fluxo como software e enxergar exatamente o caminho que foi executado no Studio.
Eu começo criando dois nós novos, um para uppercase e outro para lowercase. Eu faço isso do jeito mais direto possível, porque a lógica é simples e a intenção é deixar claro o padrão de construção.
Eu crio um arquivo uppercaseNode.ts. Esse nó recebe o state, pega o texto da última mensagem, transforma para maiúsculo, escreve isso no output e retorna o state atualizado. Ele não precisa mexer em mensagens, porque isso é responsabilidade do nó de resposta. Esse nó é apenas uma etapa de processamento, e eu quero manter essa separação bem clara.
Em seguida eu crio um arquivo lowercaseNode.ts, copiando o padrão do uppercase e mudando apenas a transformação para minúsculo. Esse reaproveitamento é proposital, porque no mundo real boa parte dos nós são variações de uma mesma ideia: ler estado, processar dado, atualizar estado.
Até aqui eu tenho três peças que fazem sentido em conjunto: o identifyIntentNode, que decide o command, os nós de transformação, que mudam o output, e o chatResponseNode, que materializa a resposta no formato de mensagem para o Studio e também deixa o resultado pronto para a API.
Com os nós prontos, eu volto para o grafo e adiciono os novos nodes no workflow. Eu declaro explicitamente cada um deles com addNode, usando nomes estáveis, porque esses nomes viram parte do “contrato visual” do fluxo. Quando eu abrir o Studio, eu quero bater o olho e entender qual caminho foi seguido sem ter que interpretar log.
A partir daí vem a peça central: as edges condicionais.
Eu coloco um addConditionalEdges logo depois do identifyIntent. A lógica é simples: eu recebo o state e retorno o nome do próximo nó que deve ser executado.
Eu faço isso com um switch case sobre state.command. Se for uppercase, eu devolvo uppercase. Se for lowercase, eu devolvo lowercase. E se não for nenhum, eu devolvo um caminho de fallback.
Esse fallback é importante, mesmo que no começo você ainda não implemente o nó. Quando você cria fluxo condicional, você precisa ter estratégia para o caso desconhecido. Em produto real, isso evita que o grafo quebre por um input inesperado. Nesta aula, eu posso começar deixando o fallback como uma rota simples que devolve uma instrução de uso.
Uma vez que o conditional edge está definido, eu preciso conectar os nós de processamento ao nó final de resposta. Então eu declaro as edges.
Quando o fluxo passa pelo uppercase, eu mando ele para chatResponse e, de chatResponse, para END. Para o lowercase, eu faço a mesma coisa.
Com isso, o fluxo deixa de ser linear e passa a ser um pipeline de verdade. Ele sempre começa em START, identifica intenção, decide caminho, executa a transformação e finaliza com resposta.
Um detalhe que vira erro chato se você esquecer é o runtime do Node em modo ES module. Como eu estou rodando TypeScript direto no Node recente, eu preciso garantir que todos os imports referenciem arquivos com a extensão .ts, senão o runtime não resolve o caminho e você começa a receber erro de módulo não encontrado. Então eu reviso os imports no graph, no server e nos nodes para garantir que todos estão corretos.
Quando eu faço isso e rodo os testes, o primeiro cenário passa.
E agora eu faço o que eu sempre recomendo: duplico teste para cobrir o segundo caminho.
Eu crio um teste para uppercase, enviando uma frase que contenha o gatilho “upper” no texto, e comparo o output com a versão em maiúsculo. Em seguida, crio outro teste para lowercase, enviando uma frase com “lower” e comparo o output com a versão em minúsculo.
Eu continuo usando o inject do Fastify. Eu não quero subir porta, não quero depender de rede, não quero flakiness. Eu simulo a requisição internamente, valido status code, faço parse do corpo e verifico o conteúdo.
Esse padrão já te coloca na mentalidade correta: o Studio é excelente para depuração visual, mas a evolução do projeto você garante com teste automatizado.
Quando ambos os testes passam, eu abro o LangGraph Studio e valido visualmente. Eu mando uma mensagem com “upper” e vejo o fluxo seguir por identifyIntent → uppercase → chatResponse. Eu mando “lower” e vejo identifyIntent → lowercase → chatResponse. Isso me dá confiança de duas formas: eu tenho validação automatizada e eu tenho rastreabilidade visual.
Agora vem o caso que normalmente quebra projetos mal desenhados: o comando desconhecido.
Se eu mando algo que não contém upper nem lower, o identifyIntent vai marcar command como unknown. E aí, se eu não tiver fallback, o grafo pode não saber para onde ir. Por isso eu sempre recomendo criar um nó de fallback.
Esse nó de fallback pode simplesmente preencher output com uma mensagem de orientação. Algo como: “Eu não identifiquei o comando. Use upper ou lower no texto.” Depois ele segue para chatResponse e encerra.
Com isso, eu fecho o pipeline completo com três caminhos: uppercase, lowercase e unknown.
No teste, eu adiciono o terceiro cenário. Eu mando um texto sem gatilho e espero que o output venha com a mensagem padrão. Isso parece simples, mas é uma das diferenças entre demonstração e produto: produto precisa ter comportamento definido para o inesperado.
No final desta aula, eu fico com uma estrutura muito clara e que escala bem.
Eu tenho nodes isolados em arquivos separados.
Eu tenho um grafo que declara fluxo de forma explícita.
Eu tenho fluxos condicionais com addConditionalEdges.
Eu tenho uma API que expõe o resultado de forma consistente.
Eu tenho testes automatizados cobrindo os caminhos principais.
E eu tenho o Studio funcionando como depurador visual, mostrando exatamente qual caminho foi executado e qual foi a evolução do estado.
A partir daqui, evoluir é previsível. Eu consigo trocar identifyIntent por um classificador real usando modelo, consigo inserir novos nós de processamento, consigo criar novas ramificações e consigo fazer isso sem virar bagunça, porque eu já tenho a arquitetura base pronta.
Esse é o tipo de disciplina que eu quero que você adote: fluxo condicional não é um “if” perdido em um controller. Fluxo condicional é parte do desenho do sistema, com estado bem definido, rastreabilidade e validação automatizada.
Capítulo 5: Definindo node de fallback, implementando casos de teste restantes
Nesta aula eu fecho o pipeline do jeito que eu considero aceitável para um fluxo condicional: eu defino explicitamente um nó de fallback e eu garanto que os testes cobrem todos os caminhos que ficaram pendentes. É aquele momento em
que o projeto deixa de ser “uma demo que funciona quando eu uso do jeito certo” e passa a ser uma API com comportamento bem definido para o inesperado.
Eu começo criando o último nó que estava faltando, o fallbackNode. Eu gosto de copiar a estrutura do lowercaseNode ou do uppercaseNode porque o padrão é idêntico: ele recebe o state, pega o input, processa e atualiza output. A diferença é que aqui eu não estou transformando string, eu estou materializando uma resposta de orientação.
Eu escrevo uma mensagem clara, do tipo: eu não sei que comando é esse, tente uppercase ou convert to lowercase para funcionar. Esse texto precisa ser estável porque ele vira o contrato do caso unknown. Em aplicação real, é aqui que você também colocaria uma estratégia mais inteligente, como pedir mais contexto ou tentar inferir intenção com um classificador. Mas neste começo, eu quero previsibilidade.
No retorno do fallbackNode eu atualizo o output com essa mensagem. E eu também adiciono essa resposta no histórico para que o LangGraph Studio mostre no chat como se fosse uma resposta da aplicação. Esse detalhe não é apenas estética. Quando você está depurando fluxo em grafo, ver a mensagem final no chat ajuda a enxergar o ciclo completo sem precisar abrir estado manualmente.
Aqui eu faço um ajuste fino que eu quero que você entenda, porque pega muita gente.
No Studio, se você adiciona uma AIMessage diretamente no array de messages em alguns cenários, você percebe a resposta aparecendo duplicada ou aparecendo uma entrada extra no log. Eu vi isso acontecer e a explicação é simples: o Studio está tentando renderizar a conversa e também renderizar logs de execução. Dependendo de como você injeta mensagens, ele pode interpretar como duas atualizações separadas.
O que eu faço para manter isso limpo é escolher um padrão e manter ele consistente. Eu posso seguir de duas maneiras.
A primeira é manter no messages apenas mensagens que realmente representam o histórico que eu quero reenviar para um LLM depois, tipicamente HumanMessage e SystemMessage. E deixar AIMessage apenas como resultado de interface, sem persistir no histórico de envio.
A segunda é persistir a AIMessage no histórico, mas garantir que eu estou colocando o content certo, como string, e evitando acoplamento com estrutura de objeto que muda. Quando eu faço isso, eu também evito que o teste quebre por causa de formato.
Nesta aula eu mantenho o comportamento simples e pragmático: o output continua sendo string e é ele que os testes validam. A mensagem adicionada ao histórico é apenas para o Studio ficar legível.
Com o fallbackNode criado, eu volto para o graph e adiciono esse nó como parte do workflow. Eu importo o fallbackNode e registro com addNode usando o nome fallback. Em seguida eu atualizo o addConditionalEdges que sai do identifyIntent. O switch case já existia para uppercase e lowercase. Agora o default retorna fallback.
Isso fecha o fluxo condicional completo.
identifyIntent decide o command. Se for uppercase, vai para uppercaseNode. Se for lowercase, vai para lowercaseNode. Se não for nenhum, vai para fallbackNode. E, em todos os casos, o caminho termina passando por chatResponse e depois por END. Eu faço questão de manter chatResponse como etapa final porque ele padroniza a materialização da resposta no chat e mantém o padrão visual do Studio.
A partir daí eu vou para os testes. Eu já tinha dois cenários principais, um para uppercase e outro para lowercase. Eles validam que a API responde 200 e que o output é exatamente a transformação esperada.
O que estava faltando era o caso unknown.
Eu adiciono o teste restante enviando um texto que não contém os gatilhos de upper nem de lower. O identifyIntent vai marcar unknown e o grafo vai cair no
fallback. O teste precisa validar o status code e comparar o output com a mensagem padrão que eu defini.
Essa etapa é importante porque ela elimina o comportamento indefinido. Sem fallback, o grafo pode ficar sem rota, pode explodir em runtime, ou pode terminar sem output preenchido. Com fallback, o fluxo sempre termina em um estado coerente.
Depois que os testes passam, eu volto ao Studio para validar visualmente. Eu crio uma nova thread, mando uma mensagem com uppercase e vejo a trilha start → identifyIntent → uppercase → chatResponse. Mando lowercase e vejo start → identifyIntent → lowercase → chatResponse. Mando uma mensagem sem gatilho e vejo start → identifyIntent → fallback → chatResponse.
E o que eu faço questão de observar no Studio é o estado a cada etapa. Eu olho command, messages e output. Eu confirmo que command está sendo preenchido corretamente e que output sempre tem um valor ao final. Isso é o mínimo de previsibilidade que eu espero de um fluxo de produção.
Eu também te mostro uma capacidade que eu uso muito no dia a dia: reexecutar a partir de um nó específico. Quando eu ajusto código de um nó, eu não preciso reiniciar todo o fluxo mentalmente. Eu consigo, no Studio, reexecutar a partir de um ponto e validar rapidamente a mudança. Isso acelera iteracão de forma absurda, especialmente quando você começa a integrar IA e ferramentas externas.
E por fim, eu reforço que esse grafo é uma Web API como qualquer outra. Eu continuo usando Fastify como porta de entrada e o endpoint /chat como interface externa. Eu posso testar com inject nos testes automatizados e posso testar também com curl, desde que eu envie o header de content-type correto para JSON.
O resultado desta aula é que eu fecho o pipeline de forma completa. Eu não tenho apenas o caminho feliz. Eu tenho um comportamento definido para o
desconhecido, eu tenho testes cobrindo os três cenários e eu tenho o Studio me mostrando visualmente o caminho executado e o estado em cada etapa.
Essa base parece simples, mas ela é exatamente o que eu quero que você internalize para quando entrar IA de verdade. Porque quando o nó de intenção virar um classificador com LLM, quando o fluxo tiver mais ramificações, quando tiver ferramentas e retries, você vai continuar seguindo o mesmo desenho: estado bem definido, caminho explícito, fallback para o inesperado e teste automatizado garantindo contrato.
