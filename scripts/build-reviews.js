const fs = require('fs');
const path = require('path');

const reviewsDir = path.join(__dirname, '../reviews');
const outputFile = path.join(__dirname, '../public/reviews.json');

const reviews = fs.readdirSync(reviewsDir)
  .filter(f => f.endsWith('.md'))
  .map(file => {
    const content = fs.readFileSync(path.join(reviewsDir, file), 'utf8');
    // Supposed frontmatter YAML on top of .md
    const match = content.match(/---\n([\s\S]*?)\n---/);
    const body = content.replace(match[0], '').trim();
    const meta = Object.fromEntries(
      match[1].split('\n').map(line => line.split(': ').map(s => s.trim()))
    );
    return {
      id: path.basename(file, '.md'),
      author: meta.author,
      comment: body,
      rating: Number(meta.rating),
      timestamp: Number(meta.timestamp)
    };
  });

// Ordering by most recent
reviews.sort((a, b) => b.timestamp - a.timestamp);

fs.writeFileSync(outputFile, JSON.stringify(reviews, null, 2));
console.log(`Gerado ${reviews.length} depoimentos em reviews.json`);
