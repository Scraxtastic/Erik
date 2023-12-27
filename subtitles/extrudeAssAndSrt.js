// extrude ass texts
const fs = require("fs");

const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

/**
 * Creates a template for the .ass files
 * @param {input folder} folder
 * @param {filename} fileName
 * @param {destination / templatePath} templatePath
 */
const createAssTemplate = (folder, fileName, templatePath) => {
  const fileText = fs.readFileSync(folder + fileName, { encoding: "utf-8" });
  const lines = fileText.split("\r\n");

  const templatedLines = lines.map((line) => {
    if (!line.startsWith("Dialogue:")) {
      return line;
    }
    const parts = line.split(",").filter((part, index) => {
      return index < 9;
    });
    let templatePart = line
      .split(",")
      .filter((_, index) => index >= 9)
      .join(",");
    let templatePrefix = "";
    if (templatePart.indexOf("{") === 0) {
      const end = templatePart.indexOf("}");
      templatePrefix = templatePart.slice(0, end + 1);
      templatePart = templatePart.slice(end + 1, templatePart.length - 1);
    }
    const template = templatePart.split("\\N").map((_, index) => `{${index}}`);
    parts.push(templatePrefix + template.join("\\N"));
    return parts.join(",");
  });
  fs.writeFileSync(templatePath, templatedLines.join("\r\n"), {
    encoding: "utf8",
    flag: "w",
  });
  console.log("Created ass template for " + fileName);
};

/**
 * extrudes the texts of the .ass files
 * @param {input folder} folder
 * @param {fileName} fileName
 * @param {destination Path} destinationPath
 */
const extrudeAss = (folder, fileName, destinationPath) => {
  console.log("Starting extrude", "ass", fileName);
  const fileText = fs.readFileSync(folder + fileName, { encoding: "utf-8" });

  const lines = fileText.replaceAll("\r", "").split("\n");

  const dialogueLines = lines
    .filter((line) => {
      return line.startsWith("Dialogue");
    })
    .map((line) => {
      const parts = line.split(",");
      const filteredParts = parts.filter((part, index) => {
        return index >= 9;
      });
      return filteredParts.join(",");
    });
  const extrudedTexts = dialogueLines
    .map((line) => {
      if (line.indexOf("{") === 0) {
        const end = line.indexOf("}");
        templatePrefix = line.slice(0, end + 1);
        line = line.slice(end + 1, line.length);
      }
      return line.replaceAll("\\N", "\n");
    })
    .join("\n\n");
  fs.writeFileSync(destinationPath, extrudedTexts, {
    encoding: "utf8",
    flag: "w",
  });
  console.log("Finished extrude", "ass", fileName);
};

/**
 * Creates a template for the .srt files
 * @param {input folder} folder
 * @param {fileName} fileName
 * @param {template / destination Path} templatePath
 */
const createSrtTemplate = (folder, fileName, templatePath) => {
  const fileText = fs.readFileSync(folder + fileName, { encoding: "utf-8" });
  const parts = fileText.split("\r\n\r\n");
  const templateParts = parts.map((part) => {
    const subParts = part.split("\r\n");
    return subParts
      .map((subPart, index) => {
        if (index < 2) {
          return subPart;
        }
        return `{${index - 2}}`;
      })
      .join("\r\n");
  });
  const templateText = templateParts.join("\r\n\r\n");
  fs.writeFileSync(templatePath, templateText, {
    encoding: "utf8",
    flag: "w",
  });
  console.log("Created srt template for " + fileName);
};

/**
 * extrudes the .str file texts for translation
 * @param {input folder} folder
 * @param {fileName} fileName
 * @param {destination Path} destinationPath
 */
const extrudeSrt = (folder, fileName, destinationPath) => {
  console.log("Starting extrude", "srt", fileName);
  const fileText = fs.readFileSync(folder + fileName, { encoding: "utf-8" });

  const parts = fileText.split("\r\n\r\n");
  const extrudedParts = parts.map((part) => {
    const lines = part.split("\r\n");
    const filteredLines = lines.filter((_, index) => {
      return index >= 2;
    });
    return filteredLines.join("\r\n");
  });

  fs.writeFileSync(destinationPath, extrudedParts.join("\n\n"), {
    encoding: "utf8",
    flag: "w",
  });
  console.log("Finished extrude", "srt", fileName);
};

// ensure input folder, so that the program doesn't crash
ensureFolder("./input");
// read all files in input folder and filter ass and srt files out
const files = fs.readdirSync("./input");
const assFiles = files.filter((fileName) => {
  return fileName.endsWith(".ass") || fileName.endsWith(".ssa");
});
const srtFiles = files.filter((fileName) => {
  return fileName.endsWith(".srt");
});

//ensure folder exists
ensureFolder("./assExtruded");
ensureFolder("./srtExtruded");
ensureFolder("./template");

//extrude all files (parse content and just take out the important texts)
assFiles.forEach((fileName) => {
  createAssTemplate("./input/", fileName, `./template/${fileName}`);
  extrudeAss("./input/", fileName, `./assExtruded/${fileName}_ex`);
});
srtFiles.forEach((fileName) => {
  createSrtTemplate("./input/", fileName, `./template/${fileName}`);
  extrudeSrt("./input/", fileName, `./srtExtruded/${fileName}_ex`);
});
