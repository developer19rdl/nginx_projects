const fs = require('fs');

try {
    let content = fs.readFileSync('src/App.js', 'utf8');

    // Make sure we have React.lazy and Suspense imports
    if (!content.includes('Suspense')) {
        content = content.replace("import React, { useEffect } from 'react';", "import React, { useEffect, Suspense, lazy } from 'react';");
    }

    // Replace static imports with lazy ones for Components only
    const importRegex = /^import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\/Components\/[^'"]+)['"];$/gm;
    content = content.replace(importRegex, "const $1 = lazy(() => import('$2'));");

    // Wrap the Routes with Suspense
    if (!content.includes('<Suspense')) {
        content = content.replace(/<Routes>/g, "<Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold'}}>Loading...</div>}>\n          <Routes>");
        content = content.replace(/<\/Routes>/g, "</Routes>\n          </Suspense>");
    }

    fs.writeFileSync('src/App.js', content);
    console.log("App.js successfully optimized with React.lazy and Suspense.");
} catch (e) {
    console.error(e);
}
