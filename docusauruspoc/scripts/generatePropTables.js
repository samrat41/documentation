const fs = require('fs-extra');
const path = require('path');

// Configs
const TYPEDOC_JSON_PATH = '../docs/typedoc.json';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/generated-props');

// Load Typedoc JSON
const typedocJson = JSON.parse(fs.readFileSync(TYPEDOC_JSON_PATH, 'utf-8'));

function findTypeByName(name) {
  const queue = [...(typedocJson.children || [])];
  while (queue.length) {
    const current = queue.shift();
    if (current.name === name) return current;
    if (current.children) queue.push(...current.children);
  }
  return null;
}

function resolveType(type) {
  if (!type) return 'unknown';
  if (type.type === 'intrinsic') return type.name;
  if (type.type === 'reference') return type.name;
  if (type.type === 'union') return type.types.map(resolveType).join(' | ');
  if (type.type === 'array') return `${resolveType(type.elementType)}[]`;
  if (type.type === 'reflection') return '{object}';
  return type.name || 'unknown';
}

function isCustomObject(type) {
    if (!type) return false;
    if (type.type === 'reference') {
      return !['string', 'number', 'boolean', 'any', 'void'].includes(type.name);
    }
    if (type.type === 'array' && type.elementType?.type === 'reference') {
      return !['string', 'number', 'boolean', 'any', 'void'].includes(type.elementType.name);
    }
    return false;
  }

function getDefaultValue(prop) {
  if (prop.defaultValue) return prop.defaultValue;
  const tag = prop.comment?.tags?.find(t => t.tag === 'default');
  return tag ? tag.text.trim() : '';
}

function extractProps(typeNode, level = 0) {
    if (!typeNode || !typeNode.children) return '';
  
    let table = `| ${'&nbsp;'.repeat(level * 2)}Prop | Type | Default | Required | Description |\n`;
    table += `|${'-'.repeat(level * 2 + 5)}|:------|:--------|:--------|:------------|\n`;
  
    let nestedSections = '';
  
    for (const prop of typeNode.children) {
      const typeText = resolveType(prop.type);
      const required = prop.flags?.isOptional ? 'No' : 'Yes';
      const description = prop.comment?.shortText?.replace(/\n/g, ' ') || '';
      const defaultValue = getDefaultValue(prop);
  
      let propName = prop.name;
      if (required === 'No') {
        propName = `<i>${propName}</i>`;
      }
  
      table += `| ${'&nbsp;'.repeat(level * 2)}${propName} | ${typeText} | ${defaultValue || '-'} | ${required} | ${description} |\n`;
  
      if (isCustomObject(prop.type)) {
        const nestedTypeName =
          prop.type.type === 'array' ? prop.type.elementType.name : prop.type.name;
        const nestedType = findTypeByName(nestedTypeName);
        if (nestedType) {
          const nestedTable = extractProps(nestedType, level + 1);
          nestedSections += `
  <details>
  <summary><b>${prop.name} (expand nested fields)</b></summary>
  
  ${nestedTable}
  
  </details>
  `;
        }
      }
    }
  
    return `${table}\n${nestedSections}`;
  }

function generateMdxForComponent(componentName) {
  const propsInterface = findTypeByName(`${componentName}Props`) || findTypeByName(componentName);
  if (!propsInterface) {
    console.warn(`⚠️  No props found for component: ${componentName}`);
    return;
  }

  const propsTable = extractProps(propsInterface);

  const mdxContent = `---
title: ${componentName} Props
---

# ${componentName} Props

${propsTable}
`;

  const outFile = path.join(OUTPUT_DIR, `${componentName}.mdx`);
  fs.ensureDirSync(OUTPUT_DIR);
  fs.writeFileSync(outFile, mdxContent);
  console.log(`✅ Generated: ${outFile}`);
}

// ✨ List your components here
const componentsToGenerate = [
  'Table'  // Add more component names if needed
];

// Run generation
componentsToGenerate.forEach(generateMdxForComponent);
