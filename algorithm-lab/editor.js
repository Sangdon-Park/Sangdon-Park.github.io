// CodeMirror owns editing and undo history; the app owns saving and grading.
let editor = null;
let editorSyncing = false;
function getCode() { return editor ? editor.getValue() : $('code').value; }
function setCode(value, resetHistory = false) {
  editorSyncing = true;
  if (editor && editor.getValue() !== value) editor.setValue(value);
  $('code').value = value;
  if (editor && resetHistory) editor.clearHistory();
  editorSyncing = false;
}
function editTab(cm) {
  if (cm.somethingSelected()) return cm.indentSelection('add');
  const cursor = cm.getCursor();
  const column = CodeMirror.countColumn(cm.getLine(cursor.line), cursor.ch, 4);
  cm.replaceSelection(' '.repeat(4 - column % 4), 'end', '+input');
}
function editBackspace(cm) {
  if (!cm.somethingSelected()) {
    const cursor = cm.getCursor(), prefix = cm.getLine(cursor.line).slice(0,cursor.ch);
    if (/^ +$/.test(prefix)) {
      const remove = cursor.ch % 4 || 4;
      cm.replaceRange('', {line:cursor.line,ch:cursor.ch-remove}, cursor, '+delete');
      return;
    }
  }
  cm.execCommand('delCharBefore');
}
function editDelete(cm) {
  if (!cm.somethingSelected()) {
    const cursor = cm.getCursor(), line = cm.getLine(cursor.line);
    if (/^ *$/.test(line.slice(0,cursor.ch)) && line[cursor.ch] === ' ') {
      const remove = Math.min(4-cursor.ch%4, line.slice(cursor.ch).match(/^ */)[0].length);
      cm.replaceRange('', cursor, {line:cursor.line,ch:cursor.ch+remove}, '+delete');
      return;
    }
  }
  cm.execCommand('delCharAfter');
}
function initEditor() {
  editor = CodeMirror.fromTextArea($('code'), {
    mode:'python', theme:'dju', lineNumbers:true, indentUnit:4, tabSize:4,
    indentWithTabs:false, smartIndent:true, electricChars:true, matchBrackets:true,
    styleActiveLine:true, lineWrapping:false, viewportMargin:20,
    extraKeys:{
      Tab:editTab, 'Shift-Tab':'indentLess', Backspace:editBackspace, Delete:editDelete,
      'Ctrl-Enter':()=>run('judge'), 'Cmd-Enter':()=>run('judge'),
      'Ctrl-Z':'undo', 'Ctrl-Y':'redo', 'Shift-Ctrl-Z':'redo',
      'Ctrl-]':'indentMore', 'Ctrl-[':'indentLess'
    }
  });
  editor.on('change',()=>{
    if (editorSyncing || !problems.length) return;
    $('code').value=editor.getValue();
    $('code').dispatchEvent(new Event('input'));
  });
  editor.on('cursorActivity',()=>{
    const cursor=editor.getCursor();
    const column=CodeMirror.countColumn(editor.getLine(cursor.line),cursor.ch,4);
    $('cursor-position').textContent=`${cursor.line+1}행 · ${column+1}열`;
  });
  for (const [id,command] of [['indent-more','indentMore'],['indent-less','indentLess'],['indent-align','indentAuto'],['editor-undo','undo']]) {
    $(id).onclick=()=>{if(busy)return;editor.focus();editor.execCommand(command);};
  }
}
