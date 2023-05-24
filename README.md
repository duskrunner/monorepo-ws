# Заметки

### 1. `./package.json`

Добавить:

```json
"workspaces": [
    "packages/*"
]
```

### 2. Копируем папку `types` из `files` в ` packages`

### 3. `monorepo-ws> yarn`

### 4. Билдим `types`

```bash
monorepo-ws> cd packages/types
monorepo-ws/packages/types> yarn build
```

### 5. Копируем папку `utility` из `files` в packages

### 6. Выносим общие части `tsconfig.json` в общий корневой файл: создаем `packages/tsconfig.settings.json` и копируем содержимое `packages/types/tsconfig.json` в него, кроме `"include": ["src"]`

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

### 7. Теперь идем в локальные конфиги и меняем их на:

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

### 8. Проверяем что билд не сломался `monorepo-ws/packages/types> yarn build`

### tsconfig.tsbuildinfo

Этот файл следит за всеми зависимостями, и перебилживает только части которые были изменены. Хэши **signature** и **version** используется для определения изменений. По сути этот файл помогает определить, соответствует ли текущий билд текущим исходникам. Таким образом ускоряется последующая сборка.

### 9. Создаем новый `packages/tsconfig.json`. нужен чтобы можно было `monorepo-ws/packages> tsc -b .` и собрать все пакеты.

```json
{
  "files": [],
  "references": [{ "path": "utility" }, { "path": "types" }]
}
```

`monorepo-ws/packages> tsc -b .`

Удалить все что было сбилжено (на случай если накосячил с конфигом и js файлы были созданы рядом с ts):

```bash
tsc -b . --clean
```

# Глобальный TS кофиг

## Расширение

**packages/tsconfig.setting.json** включает в себя общие части конфига для всех пакетов. Конфиги в пакетах наследуются от него.

## tsconfig.tsbuildinfo

Этот файл следит за всеми зависимостями, и перебилживает только части которые были изменены. Хэши **signature** и **version** используется для определения изменений. По сути этот файл помогает определить, соответствует ли текущий билд текущим исходникам. Таким образом ускоряется последующая сборка.

## Сборка всех пакетов

**packages/tsconfig.ts** нужен чтобы можно было `tsc -b .` и собрать все пакеты.
Удалить все что было сбилжено (на случай если накосячил с конфигом и js файлы были созданы рядом с ts):

```bash
tsc -b . --clean
```

# Rimraf

Rimraf по сути не зависяций от система rm -rf. Используется чтобы снести все артифакты билда.

# Lerna

## Основные команды

`lerna bootstrap` - линкует локальные пакеты и доустанавливает недостающие зависимости.

`lerna link` - создает симлинки пакетов между собой которые зависят друг от друга.

`lerna run <script>` - по сути for loop для воркспейсов, чтобы в каждом запустить \<script\>. На пример если запустить `lerna run build`, то запустятся билды во всех пакетах. При это сначала сбилдятся пакеты не зависяцие от других, а затем уже пакеты с зависимостями от других.

`lerna exec <cmd> <args...>` - работате так же как `run`, только в ней можно запускать системный команды, типа: mkdir, cp, touch и т.п.

`<command> --concurrency <number>` - запускает команды в несколько потоков, если они не имеют зависимостей между собой.

`<command> --stream` - выводит весь output в консоль.

## Husky and versioning

`yarn husky install`

`yarn husky add .husky/<hook-name> "<command-to-run>"`

`yarn commitlint -e`

`yarn lerna version --conventional-commits`

## Inner dep

`lerna add @shlack/types --scope '@shlack/{ui,data}'`
