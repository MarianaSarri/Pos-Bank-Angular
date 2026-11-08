const fs = require('node:fs');
const path = require('node:path');

const packagePath = require.resolve('@angular-architects/native-federation/package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

if (packageJson.version !== '21.1.0') {
  throw new Error(`Unsupported Native Federation version: ${packageJson.version}`);
}

const builderPath = path.join(path.dirname(packagePath), 'src/builders/build/builder.js');
const original = '    yield lastResult || { success: false };';
const replacement = [
  '    const result = lastResult || { success: false };',
  '    setTimeout(() => process.exit(result.success ? 0 : 1), 500).unref();',
  '    yield result;',
].join('\n');
const builder = fs.readFileSync(builderPath, 'utf8');

if (builder.includes(replacement)) {
  process.exit(0);
}

if (!builder.includes(original)) {
  throw new Error(`Could not apply the Native Federation exit workaround to ${builderPath}`);
}

fs.writeFileSync(builderPath, builder.replace(original, replacement));
