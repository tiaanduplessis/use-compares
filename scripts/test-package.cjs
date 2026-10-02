const assert = require('assert')
const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const root = path.resolve(__dirname, '..')
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'use-compares-package-'))
const checkout = path.join(temporary, 'checkout')
const archives = path.join(temporary, 'archives')
const consumer = path.join(temporary, 'consumer')
const modules = path.join(consumer, 'node_modules')
const installed = path.join(modules, 'use-compares')
const env = {
  ...process.env,
  npm_config_cache: path.join(temporary, 'npm-cache'),
  npm_config_offline: 'true',
  npm_config_update_notifier: 'false'
}

function copy (source, destination) {
  if (fs.statSync(source).isDirectory()) {
    fs.mkdirSync(destination, { recursive: true })
    for (const name of fs.readdirSync(source)) {
      copy(path.join(source, name), path.join(destination, name))
    }
  } else {
    fs.copyFileSync(source, destination)
  }
}

function run (command, args, cwd = checkout) {
  try {
    return execFileSync(command, args, { cwd, env, encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    if (error.code === 'ENOENT' && command === 'tar') {
      throw new Error('The package smoke test requires tar on PATH.')
    }
    throw error
  }
}

function pack (destination) {
  return run(process.execPath, [
    process.env.npm_execpath,
    'pack', '--ignore-scripts=false', '--pack-destination', destination
  ])
}

try {
  assert(process.env.npm_execpath, 'Run this test with npm run test:package')
  fs.mkdirSync(checkout)
  fs.mkdirSync(archives)
  fs.mkdirSync(installed, { recursive: true })
  for (const name of ['package.json', 'tsconfig.json', 'src', 'README.md', 'LICENSE', '.gitignore']) {
    copy(path.join(root, name), path.join(checkout, name))
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(checkout, 'node_modules'), 'junction')
  assert(!fs.existsSync(path.join(checkout, 'dist')), 'The fixture must start without dist')

  pack(archives)
  const tarballs = fs.readdirSync(archives).filter(name => name.endsWith('.tgz'))
  assert.strictEqual(tarballs.length, 1)
  const archive = path.join(archives, tarballs[0])
  const entries = run('tar', ['-tzf', archive]).trim().split(/\r?\n/)
  for (const name of [
    'index.cjs', 'index.modern.js', 'index.module.js', 'index.d.ts', 'types.d.ts',
    'custom/index.d.ts', 'deep/index.d.ts', 'deterministic/index.d.ts'
  ]) {
    assert(entries.includes(`package/dist/${name}`), `Missing dist/${name} in tarball`)
  }
  assert(!entries.some(name => name.startsWith('package/src/') || name.includes('__tests__')))
  run('tar', ['-xzf', archive, '--strip-components=1', '-C', installed])

  const manifest = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'))
  for (const name of [...Object.keys(manifest.dependencies), 'react', '@types']) {
    fs.symlinkSync(path.join(root, 'node_modules', name), path.join(modules, name), 'junction')
  }
  const hooks = ['Custom', 'Deep', 'Deterministic'].flatMap(comparison =>
    ['Memo', 'Callback', 'Effect', 'LayoutEffect'].map(hook => `use${comparison}Compare${hook}`)
  )
  const checkExports = `
    for (const name of ${JSON.stringify(hooks)}) {
      assert.strictEqual(typeof hooks[name], 'function', name);
    }
  `
  run(process.execPath, ['-e', `
    const assert = require('assert');
    const path = require('path');
    const hooks = require('use-compares');
    assert.strictEqual(require.resolve('use-compares'), path.resolve('node_modules/use-compares/dist/index.cjs'));
    ${checkExports}
  `], consumer)
  run(process.execPath, ['--input-type=module', '-e', `
    import assert from 'assert';
    import path from 'path';
    import { pathToFileURL } from 'url';
    import * as hooks from 'use-compares';
    if (typeof import.meta.resolve === 'function') {
      assert.strictEqual(import.meta.resolve('use-compares'), pathToFileURL(path.resolve('node_modules/use-compares/dist/index.modern.js')).href);
    }
    ${checkExports}
  `], consumer)

  fs.writeFileSync(path.join(consumer, 'consumer.ts'), `
    import * as hooks from 'use-compares';
    const equal = (previous: readonly unknown[], next: readonly unknown[]): boolean => previous.length === next.length;
    const custom: number = hooks.useCustomCompareMemo(() => 1, [], equal);
    const deep: number = hooks.useDeepCompareMemo(() => 1, []);
    const deterministic: number = hooks.useDeterministicCompareMemo(() => 1, []);
    hooks.useCustomCompareCallback(() => custom, [], equal)();
    hooks.useDeepCompareCallback(() => deep, [])();
    hooks.useDeterministicCompareCallback(() => deterministic, [])();
    hooks.useCustomCompareEffect(() => {}, [], equal);
    hooks.useCustomCompareLayoutEffect(() => {}, [], equal);
    hooks.useDeepCompareEffect(() => {}, []);
    hooks.useDeepCompareLayoutEffect(() => {}, []);
    hooks.useDeterministicCompareEffect(() => {}, []);
    hooks.useDeterministicCompareLayoutEffect(() => {}, []);
    // @ts-expect-error The inferred return value must retain its number type.
    const invalid: string = hooks.useDeepCompareMemo(() => 1, []);
    // @ts-expect-error A comparator must return a boolean.
    hooks.useCustomCompareMemo(() => 1, [], () => 'invalid');
  `)
  run(process.execPath, [
    path.join(root, 'node_modules/typescript/bin/tsc'),
    '--strict', '--noEmit', '--skipLibCheck', 'false', '--lib', 'es2020,dom',
    '--moduleResolution', 'node', '--module', 'commonjs', '--types', 'react', 'consumer.ts'
  ], consumer)

  const broken = JSON.parse(fs.readFileSync(path.join(checkout, 'package.json'), 'utf8'))
  broken.scripts.build = 'node -e "process.exit(42)"'
  fs.writeFileSync(path.join(checkout, 'package.json'), JSON.stringify(broken))
  const failedArchives = path.join(temporary, 'failed-archives')
  fs.mkdirSync(failedArchives)
  assert.throws(() => pack(failedArchives), error => error.status === 42)
  assert.deepStrictEqual(fs.readdirSync(failedArchives), [], 'A failed build must not produce a tarball')
  console.log('Package smoke test passed: clean pack, CJS, ESM, declarations, and build-failure guard.')
} finally {
  fs.rmSync(temporary, { recursive: true, force: true })
}
