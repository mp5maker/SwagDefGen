function convert({ inJSON, configuration }) {
  let outSwagger = undefined;
  let tabCount = undefined;
  let indentator = undefined;

  function changeIndentation(count) {
    let i;
    if (count >= tabCount) {
      i = tabCount;
    } else {
      i = 0;
      indentator = "\n";
    }
    for (; i < count; i++) {
      indentator += "\t";
    }
    tabCount = count;
  }

  function conversorSelection(obj) {
    changeIndentation(tabCount + 1);
    if (typeof obj === "number") {
      convertNumber(obj);
    } else if (Object.prototype.toString.call(obj) === "[object Array]") {
      convertArray(obj);
    } else if (typeof obj === "object") {
      convertObject(obj);
    } else if (typeof obj === "string") {
      convertString(obj);
    } else if (typeof obj === "boolean") {
      outSwagger += indentator + '"type": "boolean"';
    } else {
      alert(
        'Property type "' + typeof obj + '" not valid for Swagger definitions'
      );
    }
    changeIndentation(tabCount - 1);
  }

  function convertNumber(num) {
    if (num % 1 === 0 && !configuration.noInt) {
      outSwagger += indentator + '"type": "integer",';
      if (num < 2147483647 && num > -2147483647) {
        outSwagger += indentator + '"format": "int32"';
      } else if (Number.isSafeInteger(num)) {
        outSwagger += indentator + '"format": "int64"';
      } else {
        outSwagger += indentator + '"format": "unsafe"';
      }
    } else {
      outSwagger += indentator + '"type": "number"';
    }
    if (configuration.requestExamples) {
      outSwagger += "," + indentator + '"example": "' + num + '"';
    }
  }

  function convertString(str) {
    let regxDate = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      regxDateTime =
        /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]).([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,3})?(Z|(\+|\-)([0-1][0-9]|2[0-3]):[0-5][0-9])$/;

    outSwagger += indentator + '"type": "string"';
    if (regxDateTime.test(str)) {
      outSwagger += ",";
      outSwagger += indentator + '"format": "date-time"';
    } else if (regxDate.test(str)) {
      outSwagger += ",";
      outSwagger += indentator + '"format": "date"';
    }
    if (configuration.requestExamples) {
      outSwagger += "," + indentator + '"example": "' + str + '"';
    }
  }

  function convertArray(obj) {
    let schema = {};
    let examples = new Set();
    for (const entry of obj) {
      for (const key of Object.keys(entry)) {
        if (!Object.keys(schema).includes(key)) {
          examples.add(entry);
          schema[key] = entry[key];
        }
      }
    }

    outSwagger += indentator + '"type": "array",';
    outSwagger += indentator + '"items": {';
    conversorSelection(schema);
    outSwagger += indentator + "}";
    if (configuration.requestExamples) {
      outSwagger += ",";
      outSwagger +=
        indentator +
        '"example": ' +
        JSON.stringify(Array.from(examples), null, "\t").replaceAll(
          "\n",
          indentator
        );
    }
  }

  function convertObject(obj) {
    if (obj === null) {
      outSwagger += indentator + '"type": "' + configuration.nullType + '",';
      outSwagger += indentator + '"format": "nullable"';
      return;
    }
    outSwagger += indentator + '"type": "object",';
    outSwagger += indentator + '"properties": {';
    changeIndentation(tabCount + 1);
    for (var prop in obj) {
      outSwagger += indentator + '"' + prop + '": {';
      conversorSelection(obj[prop]);
      outSwagger += indentator + "},";
    }

    changeIndentation(tabCount - 1);
    if (Object.keys(obj).length > 0) {
      outSwagger = outSwagger.substring(0, outSwagger.length - 1);
      outSwagger += indentator + "}";
    } else {
      outSwagger += " }";
    }
  }

  function format(value, yaml) {
    if (yaml) {
      return value
        .replace(/[{},"]+/g, "")
        .replace(/\t/g, "  ")
        .replace(/(^ *\n)/gm, "");
    } else {
      return value;
    }
  }

  try {
    inJSON = JSON.parse(inJSON);
  } catch (e) {
    alert("Your JSON is invalid!\n(" + e + ")");
    return;
  }

  tabCount = 0;
  indentator = "\n";
  outSwagger = '"definitions": {';
  changeIndentation(1);
  for (var obj in inJSON) {
    outSwagger += indentator + '"' + obj + '": {';
    conversorSelection(inJSON[obj]);
    outSwagger += indentator + "},";
  }
  outSwagger = outSwagger.substring(0, outSwagger.length - 1);
  changeIndentation(tabCount - 1);
  outSwagger += indentator + "}";

  return format(outSwagger, configuration.yamlOut);
}
