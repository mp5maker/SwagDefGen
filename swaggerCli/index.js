const fs = require("fs");
const util = require("util");
const { convert } = require("./swaggerGen");
const convertYamlToDocstring = require("./convertYamlToDocstring");

const fpRead = util.promisify(fs.readFile);
const fpWrite = util.promisify(fs.writeFile);

const performAction = async () => {
  const inJSON = await fpRead("./input.json");
  const configuration = {
    noInt: false,
    requestExamples: false,
    nullType: "string",
    yamlOut: true,
    docstring: false,
  };
  const output = convert({ inJSON, configuration });
  const confirmedOutput = configuration.docstring
    ? convertYamlToDocstring(output)
    : output;
  await fpWrite(
    `./output.${configuration.yamlOut ? "yml" : "json"}`,
    confirmedOutput
  );
};

performAction();
