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


/**
 * noInt: shows number instead of integer
 * requestExamples: shows examples
 * nullType: shows null for string, or selected types
 * yamlOut: exports to yml file or else generates json file
 * docstring: adds strings to export (yml|json)
 * forcedSpace: adds extra horizontal space, for easy copy/pasting
 * inputPath: give your own input
 * outputPath
 */
const performAction = async () => {
  const configuration = {
    noInt: argv.noInt === "y" ? true : false,
    requestExamples: argv.requestExamples === "y" ? true : false,
    nullType: typeof argv.nullType === "string" ? argv.nullType : "string",
    yamlOut: argv.yamlOut === "y" ? argv.yamlOut : false,
    docstring: argv.docstring === "y" ? argv.docstring : false,
    forcedSpace: argv.forcedSpace ? argv.forcedSpace : 0,
    inputPath: argv.inputPath ? argv.inputPath : './input.json',
    outputPath: argv.outputPath ? argv.outputPath : `./output.${argv.yamlOut ? "yml" : "json"}`
  };
  const inJSON = await fpRead(configuration.inputPath);
  const output = convert({ inJSON, configuration });
  const splittedOutput = output.split("\n")
  const outputForcedSpaced = configuration.forcedSpace
    ? splittedOutput.map((line) => {
        return " ".repeat(configuration.forcedSpace) + line;
      }).join('\n')
    : output;
  const outputDocstring = configuration.docstring
    ? convertYamlToDocstring(outputForcedSpaced)
    : outputForcedSpaced;
  await fpWrite(configuration.outputPath, outputDocstring);
};

performAction();
