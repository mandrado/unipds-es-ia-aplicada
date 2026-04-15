# exemplo-00 — TensorFlow.js com Node.js no Windows

Exemplo de uso do `@tensorflow/tfjs-node` com normalização de dados e one-hot encoding.

---

## Problema: `ERR_DLOPEN_FAILED` ao rodar `node index.js`

Ao executar o projeto no Windows com **Node.js v22**, o seguinte erro ocorria:

```
Error: The specified module could not be found.
\\?\C:\...\node_modules\@tensorflow\tfjs-node\lib\napi-v8\tfjs_binding.node
    at Object..node (node:internal/modules/cjs/loader:1865:18)
    ...
    code: 'ERR_DLOPEN_FAILED'
```

### Causa

O `@tensorflow/tfjs-node` usa um binding nativo (`tfjs_binding.node`) que depende de `tensorflow.dll`. No Windows, essa DLL fica instalada em:

```
node_modules/@tensorflow/tfjs-node/deps/lib/tensorflow.dll
```

Porém o loader do Windows não encontra a DLL automaticamente nesse caminho quando carrega o binding em `lib/napi-v8/tfjs_binding.node`.

---

## Solução

### Passo 1 — Recompilar o binding para a versão do Node.js instalada

```bash
npm rebuild @tensorflow/tfjs-node --build-addon-from-source
```

> Necessário porque os binários pré-compilados podem não ser compatíveis com versões mais recentes do Node.js (v22+).

### Passo 2 — Copiar a DLL para o diretório do binding

```bash
# PowerShell
Copy-Item `
  "node_modules\@tensorflow\tfjs-node\deps\lib\tensorflow.dll" `
  "node_modules\@tensorflow\tfjs-node\lib\napi-v8\tensorflow.dll"
```

```bash
# bash / cmd
cp node_modules/@tensorflow/tfjs-node/deps/lib/tensorflow.dll \
   node_modules/@tensorflow/tfjs-node/lib/napi-v8/tensorflow.dll
```

Ao colocar a DLL no mesmo diretório do binding, o loader do Windows passa a encontrá-la automaticamente.

### Passo 3 — Executar normalmente

```bash
node index.js
```

---

## Aviso

Os passos 1 e 2 precisam ser repetidos após rodar `npm install` novamente, pois a pasta `node_modules` é recriada. Para automatizar, adicione um script `postinstall` no `package.json`:

```json
"scripts": {
  "postinstall": "npm rebuild @tensorflow/tfjs-node --build-addon-from-source && node -e \"require('fs').copyFileSync('node_modules/@tensorflow/tfjs-node/deps/lib/tensorflow.dll','node_modules/@tensorflow/tfjs-node/lib/napi-v8/tensorflow.dll')\""
}
```

---

## Ambiente testado

| Item | Versão |
|------|--------|
| Node.js | v22.19.0 |
| @tensorflow/tfjs-node | 4.22 |
| SO | Windows 11 |
