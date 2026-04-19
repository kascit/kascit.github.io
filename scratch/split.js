const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function splitFile(filename, segments) {
    const text = fs.readFileSync(path.join(srcDir, filename), 'utf8');
    const lines = text.split('\n');
    segments.forEach(seg => {
        const outPath = path.join(srcDir, seg.file);
        const dir = path.dirname(outPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
        const chunk = lines.slice(seg.start, seg.end).join('\n').trim();
        if (chunk) {
            fs.appendFileSync(outPath, chunk + '\n\n');
            console.log(`Wrote ${seg.file} (${seg.end - seg.start} lines)`);
        }
    });
}

// Ensure clean slate
['components', 'layout', 'pages', 'base'].forEach(d => {
    const dir = path.join(srcDir, d);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
});

splitFile('components.css', [
    { start: 0, end: 244, file: 'components/_code.css' },
    { start: 244, end: 399, file: 'components/_actions.css' },
    { start: 399, end: 565, file: 'components/_cards.css' },
    { start: 565, end: 621, file: 'components/_search.css' },
    { start: 621, end: 745, file: 'components/_widgets.css' },
    { start: 745, end: 1018, file: 'components/_cards.css' },
    { start: 1018, end: 1541, file: 'components/_badgeships.css' },
    { start: 1541, end: 1693, file: 'components/_widgets.css' },
    { start: 1693, end: 1727, file: 'components/_actions.css' },
    { start: 1727, end: 1974, file: 'components/_widgets.css' },
    { start: 1974, end: 2132, file: 'components/_hints.css' },
]);

splitFile('layout.css', [
    { start: 0, end: 55, file: 'base/_transitions.css' },
    { start: 55, end: 175, file: 'layout/_navigation.css' },
    { start: 175, end: 311, file: 'layout/_sidebar.css' },
    { start: 311, end: 357, file: 'components/_search.css' },
    { start: 357, end: 535, file: 'layout/_sidebar.css' },
    { start: 535, end: 555, file: 'layout/_gallery.css' },
    { start: 555, end: 842, file: 'pages/_landing.css' },
    { start: 842, end: 848, file: 'layout/_navigation.css' },
    { start: 848, end: 901, file: 'components/_cards.css' },
    { start: 901, end: 1026, file: 'layout/_navigation.css' },
    { start: 1026, end: 1390, file: 'components/_search.css' },
    { start: 1390, end: 1637, file: 'layout/_sidebar.css' },
]);
