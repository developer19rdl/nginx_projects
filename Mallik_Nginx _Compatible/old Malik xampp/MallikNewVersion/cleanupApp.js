const fs = require('fs');

try {
    let code = fs.readFileSync('src/App.js', 'utf8');

    // 1. Remove Suspense imports and usage
    code = code.replace(/import React, { useEffect, Suspense, lazy } from 'react';/g, "import React, { useEffect } from 'react';");
    code = code.replace(/<Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold'}}>Loading...<\/div>}>/g, "");
    code = code.replace(/<\/Suspense>/g, "");

    // 2. Remove massive empty line blocks (more than 2 consecutive empty lines)
    code = code.replace(/\n\s*\n\s*\n+/g, '\n\n');

    fs.writeFileSync('src/App.js', code);
    console.log('Cleaned up App.js and removed Suspense');
} catch (e) {
    console.error(e);
}
