/** Materialize trusted descriptors compiled from source templates. */
export function createNodes(descriptors) {
  const fragment = document.createDocumentFragment();
  for (const descriptor of descriptors) {
    if (typeof descriptor === 'string') {
      fragment.appendChild(document.createTextNode(descriptor));
      continue;
    }
    const [tag, namespace, attributes, children] = descriptor;
    const element = document.createElementNS(namespace, tag);
    for (const [name, value, attributeNamespace] of attributes) {
      if (attributeNamespace) element.setAttributeNS(attributeNamespace, name, value);
      else element.setAttribute(name, value);
    }
    element.appendChild(createNodes(children));
    fragment.appendChild(element);
  }
  return fragment;
}

export function privacyIcon(hidden) {
  const namespace = 'http://www.w3.org/2000/svg';
  const paths = hidden
    ? [['path', [['d', 'm3 3 18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.8']]]]
    : [['path', [['d', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z']]], ['circle', [['cx', '12'], ['cy', '12'], ['r', '3']]]];
  return createNodes([['svg', namespace, [
    ['class', 'wg-icon'], ['viewBox', '0 0 24 24'], ['fill', 'none'],
    ['stroke', 'currentColor'], ['stroke-width', '2'], ['stroke-linecap', 'round'],
    ['stroke-linejoin', 'round'], ['aria-hidden', 'true']
  ], paths.map(([tag, attributes]) => [tag, namespace, attributes, []])]]);
}
