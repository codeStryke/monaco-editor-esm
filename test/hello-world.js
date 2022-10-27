import monaco from '../dist/monaco-editor.esm.js';
import '../dist/monaco-editor-font-face.js';

// The Monaco Editor can be easily created, given an
// empty container and an options literal.
// Two members of the literal are "value" and "language".
// The editor takes the full size of its container.

monaco.editor.create(document.getElementById('container'), {
	value: "function hello() {\n\talert('Hello world!');\n}",
	language: 'javascript'
});
