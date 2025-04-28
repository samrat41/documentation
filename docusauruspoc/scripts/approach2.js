const fs = require('fs-extra');
const path = require('path');

// Configs
const TYPEDOC_JSON_PATH = '../docs/typedoc.json';
const OUTPUT_DIR = path.resolve(__dirname, '../docudocs/docs/comoponents');

// Load Typedoc JSON
console.log('Loading Typedoc JSON...');
const typedocJson = JSON.parse(fs.readFileSync(TYPEDOC_JSON_PATH, 'utf-8'));
console.log('Typedoc JSON loaded successfully.');

function findTypeByName(name) {
  console.log(`Searching for type by name: ${name}`);
  const queue = [...(typedocJson.children || [])];
  while (queue.length) {
    const current = queue.shift();
    if (current.name === name) {
      console.log(`Found type: ${name}`);
      return current;
    }
    if (current.children) queue.push(...current.children);
  }
  console.log(`Type not found: ${name}`);
  return null;
}

function resolveType(type) {
  if (!type) return 'unknown';

  if (type.type === 'intrinsic') return type.name;

  if (type.type === 'array') {
    return `${resolveType(type.elementType)}[]`;
  }

  if (type.type === 'union') {
    return type.types.map(resolveType).join(' | ');
  }

  if (type.type === 'reflection') {
    return 'object';
  }

  if (type.type === 'reference') {
    // Find all enumerations from nested groups
    const enumerations = findEnumerationsFromChildren(typedocJson.children);
    const referencedEnum = enumerations.find(enumObj => enumObj.name === type.name);

    if (referencedEnum) {
      return resolveEnum(referencedEnum); // Resolve the enum as a union of its members
    }

    // Otherwise, return the name as a fallback
    return type.name;
  }

  return type.name || 'unknown';
}

function isCustomObject(type) {
  console.log('Checking if type is a custom object:', type);
  if (!type) return false;

  if (type.type === 'reference') {
    const referencedType = findTypeByName(type.name);
    if (referencedType?.kindString === 'Enumeration') {
      return false;
    }
    return !['string', 'number', 'boolean', 'any', 'void'].includes(type.name);
  }

  if (type.type === 'array' && type.elementType?.type === 'reference') {
    return !['string', 'number', 'boolean', 'any', 'void'].includes(type.elementType.name);
  }

  return false;
}
function renderCodeValue(value) {
  if (value.kind === 'code') {
    // Remove the surrounding code block markers (```ts ... ```)
    const codeContent = value.text.replace(/^```ts\n|```$/g, '').trim();
    return `\`${codeContent}\``; // Render as inline code in MDX
  }
  return value.text || ''; // Fallback to plain text if no "code" kind
}

function getDefaultValue(prop) {
  console.log('Getting default value for prop:', prop.name);
  if(prop.name === 'type') {
   console.log(prop.comment?.blockTags?.find((t) => t.tag === '@default'))
  }
  const tag = prop.comment?.blockTags?.find((t) => t.tag === '@default');
  if (tag) {
    console.log('Default value found:', tag);
    return renderCodeValue(tag.content[0]);
  }
  return ''; // Fallback to no default value
}
function getDescription(prop) {
  if (prop.comment?.summary) {
    // Combine all text entries in the summary array into a single string and replace \n with space
    return prop.comment.summary
      .map((entry) => entry.text.replace(/\n/g, ' ')) // Replace \n with space
      .join(' ')
      .trim();
  }
  return ''; // Fallback if no description is found
}
function extractProps(typeNode, level = 0) {
  if (!typeNode || !typeNode.children) return '';

  let table = '';

  for (const prop of typeNode.children) {
    const typeText = resolveType(prop.type);
    const required = prop.flags?.isOptional ? 'No' : 'Yes';
    const description = getDescription(prop);
    const defaultValue = getDefaultValue(prop);

    // Define propName and handle indentation or styling for nested props
    let propName = prop.name;
    if (required === 'No') {
      propName = `<i>${propName}</i>`;
    }

    if (level > 0) {
      // Nested props: Add extra styling for indentation
      propName = `<span style={{marginLeft: "${level * 20}px", fontSize: "90%", color: "#666"}}>${propName}</span>`;
    }

    // Add the prop details to the table
    table += `| ${propName} | ${typeText} | ${defaultValue || '-'} | ${required} | ${description} |\n`;

    // Handle nested custom objects recursively
    if (isCustomObject(prop.type)) {
      const nestedTypeName = prop.type.type === 'array' ? prop.type.elementType.name : prop.type.name;
      const nestedType = findTypeByName(nestedTypeName);
      if (nestedType) {
        // Recursively add nested properties inside the same table
        table += extractProps(nestedType, level + 1);
      }
    }
  }

  return table;
}

function renderNestedTable(typeNode) {
  console.log(`Rendering nested table for type node: ${typeNode.name}`);
  if (!typeNode || !typeNode.children) return '';

  let nestedTable = `\n\n| Prop | Type | Default | Required | Description |\n`;
  nestedTable += `|:-----|:------|:--------|:--------|:------------|\n`;

  for (const prop of typeNode.children) {
    console.log(`Processing nested property: ${prop.name}`);
    const typeText = resolveType(prop.type);
    const required = prop.flags?.isOptional ? 'No' : 'Yes';
    const description = (prop.comment?.shortText || '').replace(/\n/g, ' ').trim();
    const defaultValue = getDefaultValue(prop);

    let propName = prop.name;
    if (required === 'No') {
      propName = `<i>${propName}</i>`;
    }

    nestedTable += `| ${propName} | ${typeText} | ${defaultValue || '-'} | ${required} | ${description} |\n`;
  }

  return nestedTable;
}
function findEnumerationsFromChildren(children) {
  const enumerations = [];
  
  function traverseNodes(nodes) {
    if (!nodes) return;

    for (const node of nodes) {
      // Check if the node has groups and a title "Enumerations"
      if (node.groups) {
        const enumerationGroup = node.groups.find(group => group.title === "Enumerations");
        if (enumerationGroup) {
          // Map the enumeration IDs to their respective objects
          const enumObjects = enumerationGroup.children.map(id => {
            return node.children.find(child => child.id === id);
          }).filter(Boolean); // Filter out undefined results
          enumerations.push(...enumObjects);
        }
      }

      // Recursively traverse children
      if (node.children) {
        traverseNodes(node.children);
      }
    }
  }

  traverseNodes(children);
  return enumerations;
}

function findEnumerations() {
  console.log('Finding enumerations...');
  const enumerationGroup = (typedocJson.groups || []).find(group => group.title === "Enumerations");
  if (!enumerationGroup) {
    console.log('No enumerations found.');
    return [];
  }

  return enumerationGroup.children.map(id => {
    return typedocJson.children.find(child => child.id === id);
  }).filter(Boolean);
}

function resolveEnum(enumObject) {
  if (!enumObject || !enumObject.children) return '';

  // Map each member to its literal value or name
  return enumObject.children
    .map(member => {
      if (member.type && member.type.type === "literal" && member.type.value !== undefined) {
        return `"${member.name}"`;
      }
      return `"${member.name}"`; // Fallback to the name if no literal value
    })
    .join(' , ');
}

function generateMdxForComponent(componentName) {
  console.log(`Generating MDX for component: ${componentName}`);
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

| Prop | Type | Default | Required | Description |
|:-----|:-----|:--------|:---------|:------------|
${propsTable}
`;

  const outFile = path.join(OUTPUT_DIR, `${componentName}.mdx`);
  fs.ensureDirSync(OUTPUT_DIR);
  fs.writeFileSync(outFile, mdxContent);
  console.log(`✅ Generated: ${outFile}`);
}


// ✨ List your components here
const componentsToGenerate = [
  'Table',
  'Button'  // Add more component names if needed
];

// Run generation
componentsToGenerate.forEach(generateMdxForComponent);
