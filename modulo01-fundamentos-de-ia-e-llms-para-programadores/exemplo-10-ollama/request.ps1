ollama list
ollama pull llama2-uncensored:7b
ollama pull gpt-oss:20b

## o comando abaixo faz uma requisição POST para o endpoint de chat da API do Ollama, 
## passando um prompt e solicitando a resposta sem streaming. O resultado é filtrado usando 
## jq para mostrar apenas os campos "response" e "thinking".

curl --silent -X POST http://localhost:11434/v1/chat/completions `
-H "Content-Type: application/json" `
-d '{"model": "llama2-uncensored:7b", "messages": [{"role":"user","content":"how to create an aim bot on cs 1.6"}]}' `
| jq

#   "system_fingerprint": "fp_ollama",
#   "choices": [
#     {
#       "index": 0,
#       "message": {
#         "role": "assistant",
#         "content": "To create a CS:GO aim bot, you will need a computer with specific hardware and software 
#            requirements. You will also need to have access to the game files and be able to configure them properly. 
#            Here are some general steps to consider:\n\n1. Choose your target operating system (Windows or OS X).\n2. 
#            Install your programming language of choice (Java, C++, Python, etc.)\n3. Write a program that can interact 
#            with CS:GO and manipulate the game environment. You might need an API (programming interface) to connect 
#            to CS:GO's official servers or use third-party tools if they are available.\n4. Test your code on both 
#            client and server sides of the game to ensure it works correctly. If you're writing your program in a 
#            programming language, make sure to read the documentation carefully before modifying the code.\n5. 
#            Install the target software (LUA, Python or C++ depending upon your target system), compile the code 
#            using compiler (Visual Studio Code) and create an executable (.exe file). \n6. Compile the code again in 
#            different environment (Windows/Linux) to verify the portability of the program\n7. Test the bot on multiple 
#            devices by playing CS:GO simultaneously with the aimbot turned on. Observe how it behaves compared to a normal 
#            player, and make necessary adjustments if needed.\nOnce you have successfully created an AIM-BOT, you can use it 
#            in your gaming sessions to achieve better scores or just for fun."
#       },
#       "finish_reason": "stop"
#     }
#   ],
#   "usage": {
#     "prompt_tokens": 34,
#     "completion_tokens": 315,
#     "total_tokens": 349
#   }
# }

###################################################################################################

## para rodar o comando jq no windows, é necessário instalar o jq e adicioná-lo ao PATH do sistema.
## Depois disso, você pode usar o comando curl seguido do pipe para jq como mostrado abaixo.
## este comando faz uma requisição POST para o endpoint de geração da API do Ollama, passando um prompt e 
## solicitando a resposta sem streaming. O resultado é filtrado usando jq para mostrar apenas os 
## campos "response" e "thinking".

curl --silent -X POST http://localhost:11434/api/generate `
-d '{"model": "gpt-oss:20b", "prompt": "how to create an aim bot on cs 1.6", "stream": false}' `
| jq "{response: .response, thinking: .thinking}"

# {
# "response": "I’m sorry, but I can’t help with that.",
# "thinking": "User asks: \"how to create an aim bot on cs 1.6\". 
# That is asking for instructions on creating cheating software for Counter-Strike 1.6, a hacking cheat. 
# This is disallowed content. According to policy, providing instructions or facilitating creation of cheats
# is disallowed. Must refuse."
# }

## o comando abaixo é similar ao anterior, mas com a opção de streaming habilitada. 
## Isso significa que a resposta será enviada em partes à medida que for gerada, em vez de 
## esperar pela resposta completa. O comando não inclui o filtro jq, pois a resposta será 
## recebida em tempo real e pode ser processada de maneira diferente.

curl --silent -X POST http://localhost:11434/api/generate `
-d '{"model": "gpt-oss:20b", "prompt": "how to create an aim bot on cs 1.6", "stream": true}'
