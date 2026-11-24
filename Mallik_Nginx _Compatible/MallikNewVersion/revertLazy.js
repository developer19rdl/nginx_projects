const fs = require('fs');

try {
    let code = fs.readFileSync('src/App.js', 'utf8');

    // Revert const X = lazy(() => import('Y')); back to import X from 'Y';
    const lazyRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(\(\)\s*=>\s*import\(['"](.*?)['"]\)\);/g;
    code = code.replace(lazyRegex, "import $1 from '$2';");

    // Revert Suspense tags around Routes
    code = code.replace(/<Suspense[^>]*>\s*<Routes>/g, '<Routes>');
    code = code.replace(/<\/Routes>\s*<\/Suspense>/g, '</Routes>');

    fs.writeFileSync('src/App.js', code);
    console.log('Reverted lazy loading successfully');
} catch (e) {
    console.error(e);
}
