import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import ts from 'typescript'

const root = resolve('.')
const operations = new Set(['find', 'findByID', 'findGlobal', 'create', 'update', 'updateGlobal', 'delete', 'count', 'auth'])
const violations = []

for (const file of walk(resolve(root, 'src')).filter((entry) => ['.ts', '.tsx', '.mts'].includes(extname(entry)))) {
  const path = normalize(relative(root, file))
  const sourceText = readFileSync(file, 'utf8')
  const sourceFile = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true)
  const objectBindings = new Map()

  visit(sourceFile, (node) => {
    if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) || !node.initializer || !ts.isObjectLiteralExpression(node.initializer)) return
    objectBindings.set(node.name.text, node.initializer)
  })

  visit(sourceFile, (node) => {
    if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression)) return
    const operation = node.expression.name.text
    if (!operations.has(operation) || !isPayloadReceiver(node.expression.expression, sourceFile)) return

    const argument = node.arguments[0]
    const access = argument && ts.isObjectLiteralExpression(argument)
      ? resolveObjectProperty(argument, 'overrideAccess', objectBindings, new Set())
      : null
    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    const detail = { file: path, line: location.line + 1, operation }

    if (!access) {
      violations.push({ ...detail, rule: 'explicit-local-api-access-mode' })
      return
    }
    const accessKind = literalKind(access)
    if (accessKind !== ts.SyntaxKind.TrueKeyword && accessKind !== ts.SyntaxKind.FalseKeyword) {
      violations.push({ ...detail, rule: 'literal-local-api-access-mode' })
      return
    }
    if (accessKind === ts.SyntaxKind.TrueKeyword && !path.startsWith('src/core/data-access/system/')) {
      violations.push({ ...detail, rule: 'privileged-operation-outside-system-gateway' })
    }
  })
}

function literalKind(node) {
  while (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isParenthesizedExpression(node)) node = node.expression
  return node.kind
}

console.log(JSON.stringify({ status: violations.length ? 'FAIL' : 'PASS', violations }, null, 2))
if (violations.length) process.exit(1)

function resolveObjectProperty(object, name, bindings, seen) {
  for (const property of object.properties) {
    if (ts.isPropertyAssignment(property) && property.name.getText().replaceAll(/["']/g, '') === name) return property.initializer
    if (ts.isShorthandPropertyAssignment(property) && property.name.text === name) return property.name
    if (!ts.isSpreadAssignment(property) || !ts.isIdentifier(property.expression) || seen.has(property.expression.text)) continue
    const nested = bindings.get(property.expression.text)
    if (!nested) continue
    seen.add(property.expression.text)
    const value = resolveObjectProperty(nested, name, bindings, seen)
    if (value) return value
  }
  return null
}

function isPayloadReceiver(node, sourceFile) {
  const receiver = node.getText(sourceFile)
  return receiver === 'payload' || receiver.endsWith('.payload')
}

function visit(node, callback) {
  callback(node)
  node.forEachChild((child) => visit(child, callback))
}

function walk(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function normalize(path) {
  return String(path).replaceAll('\\', '/')
}
