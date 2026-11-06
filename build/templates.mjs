import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFragment } from 'parse5';
import { MESSAGE_TYPES } from '../src/filters.js';

function describe(node) {
  if (node.nodeName === '#text') return node.value;
  if (!node.tagName) return null;
  if (node.tagName === 'script' || node.tagName === 'template') throw new Error('Executable/nested templates are not allowed');
  const attributes = node.attrs.map(({ name, value, namespace }) => {
    if (/^on/i.test(name) || name === 'srcdoc' || /^\s*javascript:/i.test(value)) throw new Error(`Unsafe template attribute: ${name}`);
    return [name, value, namespace || null];
  });
  return [node.tagName, node.namespaceURI, attributes, node.childNodes.map(describe).filter(node => node !== null)];
}

/** Parse trusted source HTML once at build time; ship DOM descriptors only. */
export function templatesPlugin(version) {
  return {
    name: 'static-dom-templates',
    setup(build) {
      build.onResolve({ filter: /\.html\?dom$/ }, args => ({
        path: path.resolve(args.resolveDir, args.path.slice(0, -4)),
        namespace: 'dom-template'
      }));
      build.onLoad({ filter: /.*/, namespace: 'dom-template' }, async ({ path: filename }) => {
        const source = (await readFile(filename, 'utf8'))
          .replaceAll('__WIPEGRAM_VERSION__', version)
          .replaceAll('__WIPEGRAM_TYPE_OPTIONS__', MESSAGE_TYPES.map(type => `<option value="${type.value}">${type.label}</option>`).join(''));
        const nodes = parseFragment(source).childNodes.map(describe).filter(node => node !== null);
        return { contents: `export default ${JSON.stringify(nodes)};`, loader: 'js', watchFiles: [filename, path.resolve('src/filters.js')] };
      });
    }
  };
}
