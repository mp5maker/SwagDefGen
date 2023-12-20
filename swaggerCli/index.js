#!/usr/bin/env node
const fs = require("fs");
const util = require("util");
const { convert } = require("./swaggerGen");
const convertYamlToDocstring = require("./convertYamlToDocstring");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const fpRead = util.promisify(fs.readFile);
const fpWrite = util.promisify(fs.writeFile);

const performAction = async () => {
  const inJSON = await fpRead("./input.json");

  const configuration = {
    noInt: argv.noInt === "y" ? true : false,
    requestExamples: argv.requestExamples === "y" ? true : false,
    nullType: typeof argv.nullType === "string" ? argv.nullType : "string",
    yamlOut: argv.yamlOut === "y" ? argv.yamlOut : false,
    docstring: argv.docstring === "y" ? argv.docstring : false,
    forcedSpace: argv.forcedSpace ? argv.forcedSpace : 0,
  };

  const outputPath = `./output.${configuration.yamlOut ? "yml" : "json"}`;
  const output = convert({ inJSON, configuration });
  const splittedOutput = output.split("\n")
  const outputForcedSpaced = configuration.forcedSpace
    ? splittedOutput.map((line, index) => {
        return " ".repeat(configuration.forcedSpace) + line;
      }).join('\n')
    : output;
  const outputDocstring = configuration.docstring
    ? convertYamlToDocstring(outputForcedSpaced)
    : outputForcedSpaced;
  await fpWrite(outputPath, outputDocstring);
};

performAction();
