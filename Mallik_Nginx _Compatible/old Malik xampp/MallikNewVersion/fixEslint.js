const fs = require('fs');

try {
    let code = fs.readFileSync('src/App.js', 'utf8');

    // Regex to match ES6 import statements (both single-line and multi-line)
    const importRegex = /^import\s+(?:{([^}]*)}|[A-Za-z0-9_*, \n]+)\s+from\s+['"][^'"]+['"];|^import\s+['"][^'"]+['"];/gm;

    let match;
    let imports = [];

    while ((match = importRegex.exec(code)) !== null) {
        imports.push(match[0]);
    }

    // Remove all matched imports from the code
    let newCode = code.replace(importRegex, '');

    // Now push them to the very top
    newCode = imports.join('\n') + '\n\n' + newCode.trimStart();

    fs.writeFileSync('src/App.js', newCode);
    console.log('Fixed ESLint import orders');
} catch (e) {
    console.error(e);
}
