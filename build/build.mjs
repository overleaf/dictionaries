import fs from "node:fs/promises";
import languages from "./languages.json" with { type: "json" };

const OUTPUT_DIR = "/dictionaries";

const setRe = /^SET\s/;

const readFile = async (basename, encoding) => {
  const data = await fs.readFile(`/usr/share/hunspell/${basename}`);
  return new TextDecoder(encoding).decode(data);
};

const readEncoding = async (basename) => {
  const content = await readFile(basename);

  for (const line of content.split("\n")) {
    if (setRe.test(line)) {
      return line.replace(setRe, "").trim();
    }
  }
};

for (const language of languages) {
  // encoding
  const encoding =
    language.encoding ?? (await readEncoding(`${language.file}.aff`));

  if (!encoding) {
    throw new Error(`No encoding SET in ${language.file}.aff`);
  }

  console.log(language.file, encoding);

  // affix file
  const aff = await readFile(`${language.file}.aff`, encoding);
  await fs.writeFile(
    `${OUTPUT_DIR}/${language.file}.aff`,
    aff
      .split("\n")
      .map((line) => (setRe.test(line) ? "SET UTF-8" : line))
      .join("\n"),
  );

  // dictionary file
  const dic = await readFile(`${language.file}.dic`, encoding);
  await fs.writeFile(`${OUTPUT_DIR}/${language.file}.dic`, dic);

  // copyright file
  await fs.copyFile(
    `/usr/share/doc/${language.package}/copyright`,
    `${OUTPUT_DIR}/${language.package}.copyright.txt`,
  );
}

console.log(`Processed ${languages.length} languages into ${OUTPUT_DIR}`);
