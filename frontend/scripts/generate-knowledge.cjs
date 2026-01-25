const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../../docs');
const outputFile = path.join(__dirname, '../app/lib/knowledge.json');
const ignoreDirs = ['archive', 'stitch', 'templates', 'legacy'];

const getAllFiles = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                getAllFiles(filePath, fileList);
            }
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });
    return fileList;
};

try {
    console.log('Generating knowledge base from:', docsDir);
    const allDocPaths = getAllFiles(docsDir);
    const knowledge = allDocPaths.map(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativeName = path.relative(docsDir, filePath);
        return {
            source: relativeName.replace(/\\/g, '/'),
            content: content
        };
    });

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(knowledge, null, 2));
    console.log('Knowledge base generated successfully at:', outputFile);
    console.log('Total documents processed:', knowledge.length);
} catch (error) {
    console.error('Failed to generate knowledge base:', error);
    process.exit(1);
}
