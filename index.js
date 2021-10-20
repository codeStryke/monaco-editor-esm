import * as monaco from 'monaco-editor';
// Inlining the import of web worker since the path from where it will be served is not known at compile time
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker()
  }
}
export default monaco;
