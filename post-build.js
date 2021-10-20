import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';

// regex to find font-face string in generated css
// there are 3 capture groups:
// 1. font-family name
// 2. data
// 3. format
const fontFaceRegex = /@font-face{font-family:"(\w+)".*url\((data:.*)\)\s(format\("\w+"\))}/g;
const fontFaceFileName = 'style.css.js';

const style =  readFileSync('./dist/style.css', 'utf8');

const output = `export default \`${style.replace(fontFaceRegex, '').replace('\\', '\\\\')}\`;`
writeFileSync(`./dist/${fontFaceFileName}`, output);

const matches = [...style.matchAll(fontFaceRegex)];
const fontFamilyName = matches[0][1];
const dataStr = matches[0][2];
const formatStr = matches[0][3];

// create a font-face file
const fontFaceFile = `
const monacoEditorFontFace = new FontFace('${fontFamilyName}',
  'url("${dataStr}") ${formatStr}');
monacoEditorFontFace.load()
  .then(loadedFontFace => {
    document.fonts.add(loadedFontFace);
  });
`;
writeFileSync('./dist/monaco-editor-font-face.js', fontFaceFile);

// delete unused files
const filesToKeep = [
  'index.js',
  'editor.worker', // this file will have an generated hash
  'monaco-editor',
  'sql.js', // this is the only language we support for now
  fontFaceFileName,
];

const files = readdirSync('./dist');
files.forEach(file => {
  let deleteFile = true;
  filesToKeep.forEach(fileToKeep => {
    if (file.startsWith(fileToKeep)) {
      deleteFile = false;
    }
  });
  if (deleteFile) {
    unlinkSync(`./dist/${file}`);
  }
});