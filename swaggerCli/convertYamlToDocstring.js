function convertYamlToDocstring(yamlContent) {
  const lines = yamlContent.split("\n");
  let docstring = "/**\n";

  lines.forEach((line) => {
    docstring += ` * ${line}\n`;
  });

  docstring += " */";

  return docstring;
}

module.exports = convertYamlToDocstring;
