# Заметки

## 1. Добавляем первый пакет

Добавить `./package.json`:

```json
"workspaces": [
    "packages/*"
]
```

Копируем папку `types` из `files` в ` packages`

Ставим пакеты:

```bash
monorepo-ws> yarn
```

Билдим `types`:

```bash
monorepo-ws> cd packages/types
monorepo-ws/packages/types> yarn build
```

## 2. Добавляем второй пакет

Копируем папку `utility` из `files` в packages

Выносим общие части `tsconfig.json` в общий корневой файл: создаем `packages/tsconfig.settings.json` и копируем содержимое `packages/types/tsconfig.json` в него, кроме `"include": ["src"]`

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "types": [],
    "sourceMap": true,
    "target": "ES2018",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

Теперь идем в локальные конфиги и меняем их на:

```json
{
  "extends": "../tsconfig.settings.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Проверяем что билд не сломался

```bash
monorepo-ws/packages/types> yarn build
```

`tsconfig.tsbuildinfo` - Этот файл следит за всеми зависимостями, и перебилживает только части которые были изменены. Хэши **signature** и **version** используется для определения изменений. По сути этот файл помогает определить, соответствует ли текущий билд текущим исходникам. Таким образом ускоряется последующая сборка.

Создаем новый `packages/tsconfig.json`. нужен чтобы можно было

```bash
monorepo-ws/packages> tsc -b .
```

и собрать все пакеты.

```json
{
  "files": [],
  "references": [{ "path": "utility" }, { "path": "types" }]
}
```

```bash
monorepo-ws/packages> tsc -b .
```

Удалить все что было сбилжено (на случай если накосячил с конфигом и js файлы были созданы рядом с ts):

```bash
tsc -b . --clean
```

## 3. Rimraf

Rimraf по сути не зависяций от система rm -rf. Используется чтобы снести все артифакты билда.
Ставим как зависимоть в корень нашего проекта:

```bash linenums="monorepo-ws>"
monorepo-ws> yarn add -WD rimraf
```

Идем в каждый пакет в файл package.json добавляем новый скрипт:

```json
"clean": "rimraf --glob dist *.tsbuildinfo",
```

Затем проверяем очистку:

```bash
monorepo-ws> cd packages/types
monorepo-ws/packages/types> yarn clean
monorepo-ws/packages/types> yarn build
monorepo-ws/packages/types> yarn clean
```

Заметно, что мы повторяем один и тот же патерн в каждом пакете, но мы это скоро пофиксим.

## 4. Тестирование

Будем использовать jest, но для того, чтобы jest понимал ts, на нужен babel

```bash
monorepo-ws/packages/types> yarn add -D @babel/preset-env @babel/preset-typescript
monorepo-ws/packages/utility> yarn add -D @babel/preset-env @babel/preset-typescript
```

Создаем в ./packages `.babelrc`:

```json
{
  "presets": [["@babel/preset-env", { "targets": { "node": 10 } }], "@babel/preset-typescript"]
}
```

А в каждом пакете создаем так же `.babelrc`:

```json
{
  "extends": "../.babelrc"
}
```

```bash
monorepo-ws/packages/utility> yarn jest
monorepo-ws/packages/types> yarn jest
```

В обоих package.json добавляем скрипт для тестов:

```json
"test": "jest",
```

## 5. Линтинг

Копируем files/.eslintrc в корень. В корень потому-что большинство IDE ожидают, что он будет там. В частности VS Code работает так, если хотим использовать конфиг из определенной папки то в настройках нужно прописать eslint.workingDirectories: []

```bash
monorepo-ws> yarn add -WD eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

Создаем `.eslintrc` в каждом пакете с содержимым:

```json
{
  "extends": "../../.eslintrc",
  "parserOptions": {
    "project": "tsconfig.json" // Эта часть нужна, так-как мы не знаем каков код нашего проекта(на пример может сдесть react и jsx и eslint'у нужно его понимать)
  }
}
```

И последнее, добавляем линт скрипт в каждый пакет:

```json
"lint": "eslint src --ext js,ts",
```

Проверяем, что всё работает:

```bash
monorepo-ws/packages/utility> yarn lint
```

## 6. Lerna

Одно из приимуществ Lerna, она позволяет запускать команды в каждом пакете (как forloop)

Ставим:

```bash
monorepo-ws> yarn add -DW lerna
```

Копируем ./files/lerna.json в корень

```json
"version": "0.0.1" //Можно выставить в independent, чтобы версии пакетов были независимы
```

```bash
monorepo-ws> yarn lerna --help
```

`lerna link` - если наши пакеты имеют зависимости друг с другом, то lerna создаст symblink в node_modules для них.

`lerna bootstrap` - линкует локальные пакеты и доустанавливает недостающие зависимости.

`lerna run <script>` - по сути for loop для воркспейсов, чтобы в каждом запустить \<script\>. На пример если запустить `lerna run build`, то запустятся билды во всех пакетах. При это сначала сбилдятся пакеты не зависяцие от других, а затем уже пакеты с зависимостями от других.

`lerna exec <cmd> <args...>` - работате так же как `run`, только в ней можно запускать системный команды, типа: mkdir, cp, touch и т.п.

Создадим бесполезную зависимость в ./packages/utility/package.json добавим:

```json
  "@mono/types": "^0.0.1"
```

```bash
monorepo-ws> yarn lerna link
```

Идем в ulitity/node_modules и видим что была создана symlink на @mono/types

```bash
monorepo-ws> yarn lerna run clean
```

```bash
monorepo-ws> yarn lerna build
```

Теперь из-за того что у нас utility зависит от types, сначала будет собран, types, а затем уже utility

Удаляем зависимость "@mono/types": "^0.0.1" и запускам:

```bash
monorepo-ws> yarn lerna bootstrap
```

Симлинк должен пропасть

```bash
monorepo-ws> yarn lerna build
```

Порядок выполнения может стать другим

`<command> --concurrency <number>` - запускает команды в несколько потоков, если они не имеют зависимостей между собой.

`<command> --stream` - выводит весь output в консоль.

## Husky and versioning

`yarn husky install`

`yarn husky add .husky/<hook-name> "<command-to-run>"`

`yarn commitlint -e`

`yarn lerna version --conventional-commits`

## Inner dep

`lerna add @shlack/types --scope '@shlack/{ui,data}'`
