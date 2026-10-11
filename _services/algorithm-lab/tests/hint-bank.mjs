import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
const ctx=vm.createContext({});
for(const file of ['hint-references.js','java-problems.js','java-hint-references.js','problem-catalog.js'])vm.runInContext(read('algorithm-lab/'+file),ctx);
vm.runInContext('this.references=HINT_REFERENCES;this.javaReference=javaHintReference;this.duplicates=LAB_DUPLICATES;',ctx);
export const hintBank=['problems.json','chapter-02.json','exercise-problems.json'].flatMap(file=>JSON.parse(read('algorithm-lab/'+file))).filter(p=>!ctx.duplicates[p.id]);
export const hintReference=(p,lang)=>lang==='java'?ctx.javaReference(p):ctx.references[p.id]?.[lang]||(lang==='c'?p.c?.solution:p.solution);
if(process.argv[1]&&new URL('file:///'+process.argv[1].replaceAll('\\','/')).href===import.meta.url)console.log(JSON.stringify(hintBank.map(p=>({...p,solution:hintReference(p,'python')}))));
