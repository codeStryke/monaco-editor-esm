import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline'

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker()
  }
}
export default monaco;
