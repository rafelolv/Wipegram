import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFragment } from 'parse5';
import { MESSAGE_TYPES } from '../src/filters.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

function describe(node, logo) {
  if (node.nodeName === '#text') return node.value;
  if (!node.tagName) return null;
  if (node.tagName === 'wipegram-logo') {
    const svg = parseFragment(logo).childNodes.find(child => child.tagName === 'svg');
    const className = node.attrs.find(attribute => attribute.name === 'class')?.value || '';
    svg.attrs = svg.attrs.filter(attribute => !['width', 'height', 'role', 'aria-labelledby'].includes(attribute.name));
    svg.attrs.push({ name: 'class', value: className }, { name: 'aria-hidden', value: 'true' });
    svg.childNodes = svg.childNodes.filter(child => !['title', 'desc'].includes(child.tagName));
    return describe(svg, logo);
  }
  if (node.tagName === 'script' || node.tagName === 'template') throw new Error('Executable/nested templates are not allowed');
  const attributes = node.attrs.map(({ name, value, namespace }) => {
    if (/^on/i.test(name) || name === 'srcdoc' || /^\s*javascript:/i.test(value)) throw new Error(`Unsafe template attribute: ${name}`);
    return [name, value, namespace || null];
  });
  return [node.tagName, node.namespaceURI, attributes, node.childNodes.map(child => describe(child, logo)).filter(node => node !== null)];
}

/** Parse trusted source HTML once at build time; ship DOM descriptors only. */
export function templatesPlugin(version) {
  return {
    name: 'static-dom-templates',
    setup(build) {
      build.onResolve({ filter: /\.html\?dom$/ }, args => ({
        path: path.relative(ROOT, path.resolve(args.resolveDir, args.path.slice(0, -4))).split(path.sep).join('/'),
        namespace: 'dom-template'
      }));
      build.onLoad({ filter: /.*/, namespace: 'dom-template' }, async ({ path: filename }) => {
        const absoluteFilename = path.resolve(ROOT, filename);
        const source = (await readFile(absoluteFilename, 'utf8'))
          .replaceAll('__WIPEGRAM_VERSION__', version)
          .replaceAll('__WIPEGRAM_TYPE_OPTIONS__', MESSAGE_TYPES.map(type => `<option value="${type.value}">${type.label}</option>`).join(''));
        const logoFile = path.join(ROOT, 'images/icon.svg');
        const logo = await readFile(logoFile, 'utf8');
        const nodes = parseFragment(source).childNodes.map(node => describe(node, logo)).filter(node => node !== null);
        return { contents: `export default ${JSON.stringify(nodes)};`, loader: 'js', watchFiles: [absoluteFilename, path.join(ROOT, 'src/filters.js'), logoFile] };
      });
    }
  };
}
