// Compiler coordinates already refer to student lines via #line in c-worker.js.
function parseCDiagnostics(log) {
  return [...log.matchAll(/^([^\n]+?):(\d+):(\d+):\s*(fatal error|error|warning|note):\s*(.*)$/gm)].map(match => ({
    file: match[1].trim(), line: Number(match[2]), column: Number(match[3]),
    severity: match[4], message: match[5]
  }));
}
