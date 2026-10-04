import { readFile } from 'node:fs/promises';
import ts from 'typescript';
export async function loadRoutes() {
 const source=await readFile(new URL('../src/lib/routes.ts',import.meta.url),'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
 return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
}
