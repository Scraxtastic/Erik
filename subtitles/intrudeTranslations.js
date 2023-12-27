const fs = require("fs");

const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

const intrudeAss = (fileName) => {
  const translated = fs.readFileSync(`./translated/${fileName}`, {
    encoding: "utf-8",
  });
  const template = fs.readFileSync(`./template/${fileName.slice(0, -3)}`, {
    encoding: "utf-8",
  });
  if (template == null) {
    console.warn(`Skipping ${fileName}. [404 FileNotFound]`);
    return;
  }
  let templateLines = template.split("\r\n");
  let dialogueStartLine = 0;
  for (let i = 0; i < templateLines.length; i++) {
    if (templateLines[i].startsWith("Dialogue:")) {
      dialogueStartLine = i;
      break;
    }
  }
  const parts = translated.split("\n\n");
  parts.forEach((part, index) => {
    const lines = part.split("\n");
    lines.forEach((line, lineIndex) => {
      templateLines[dialogueStartLine + index] = templateLines[
        dialogueStartLine + index
      ].replace(`{${lineIndex}}`, line);
    });
  });
  fs.writeFileSync(
    `./finished/${fileName.slice(0, -3)}`,
    templateLines.join("\r\n"),
    {
      encoding: "utf-8",
      flag: "w",
    }
  );
  console.log("Finished intruding", "ass", fileName);
};

const intrudeSrt = (fileName) => {
  const translated = fs.readFileSync(`./translated/${fileName}`, {
    encoding: "utf-8",
  });
  const template = fs.readFileSync(`./template/${fileName.slice(0, -3)}`, {
    encoding: "utf-8",
  });
  if (template == null) {
    console.warn(`Skipping ${fileName}. [404 FileNotFound]`);
    return;
  }
  const translations = translated.replaceAll("\r", "").split("\n\n");
  const templateParts = template.split("\r\n\r\n");
  if (translations.length !== templateParts.length) {
    console.warn(`Skipping ${fileName}. [Translation length mismatch]`);
    return;
  }
  for (let i = 0; i < templateParts.length; i++) {
    const lines = translations[i].split("\n");
    for (let j = 0; j < lines.length; j++) {
      templateParts[i] = templateParts[i].replace(`{${j}}`, lines[j]);
    }
  }

  const translation = templateParts.join("\r\n\r\n");

  fs.writeFileSync(`./finished/${fileName.slice(0, -3)}`, translation, {
    encoding: "utf-8",
    flag: "w",
  });
  console.log("Finished intruding", "srt", fileName);
};

// ensure translated folder, so that the program doesn't crash
ensureFolder("./translated");
ensureFolder("./template");
ensureFolder("./finished");
// read all files in input folder and filter ass and srt files out
const files = fs.readdirSync("./translated");
const translatedAssFiles = files.filter((fileName) => {
  return fileName.endsWith(".ass_ex") || fileName.endsWith(".ssa_ex");
});
const translatedSrtFiles = files.filter((fileName) => {
  return fileName.endsWith(".srt_ex");
});

translatedAssFiles.forEach((fileName) => {
  intrudeAss(fileName);
});

translatedSrtFiles.forEach((fileName) => {
  intrudeSrt(fileName);
});
