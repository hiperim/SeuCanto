const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

class ReviewBuilder {
  constructor() {
    this.reviewsDir = path.join(__dirname, '../reviews');
    this.outputFile = path.join(__dirname, '../public/reviews.json');
    this.backupFile = path.join(__dirname, '../public/reviews-backup.json');
    this.stats = {
      processed: 0,
      errors: 0,
      warnings: 0
    };
  }

  async build() {
    console.log('🔨 Iniciando build de reviews...');
    
    try {
      // Backup do arquivo atual
      await this.createBackup();
      
      // Processar reviews
      const reviews = await this.processReviews();
      
      // Validar dados
      this.validateReviews(reviews);
      
      // Salvar resultado
      await this.saveReviews(reviews);
      
      this.logStats(reviews);
      
    } catch (error) {
      console.error('❌ Erro durante o build:', error);
      await this.restoreBackup();
      process.exit(1);
    }
  }

  async createBackup() {
    if (fs.existsSync(this.outputFile)) {
      fs.copyFileSync(this.outputFile, this.backupFile);
      console.log('📦 Backup criado');
    }
  }

  async processReviews() {
    if (!fs.existsSync(this.reviewsDir)) {
      console.warn('⚠️ Pasta reviews/ não encontrada');
      return [];
    }

    const files = fs.readdirSync(this.reviewsDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    const reviews = [];

    for (const file of files) {
      try {
        const review = await this.processFile(file);
        if (review) {
          reviews.push(review);
          this.stats.processed++;
        }
      } catch (error) {
        console.error(`❌ Erro processando ${file}:`, error.message);
        this.stats.errors++;
      }
    }

    return reviews;
  }

  async processFile(filename) {
    const filepath = path.join(this.reviewsDir, filename);
    const content = fs.readFileSync(filepath, 'utf8');
    
    const parsed = matter(content);
    const { data: frontmatter, content: body } = parsed;

    // Validações básicas
    if (!frontmatter.author || !frontmatter.rating || !frontmatter.timestamp) {
      throw new Error('Campos obrigatórios ausentes: author, rating, timestamp');
    }

    // Processar markdown para HTML
    const htmlContent = marked(body.trim());
    
    // Gerar ID único
    const id = path.basename(filename, '.md');
    
    return {
      id,
      author: String(frontmatter.author).trim(),
      email: frontmatter.email || null,
      rating: Number(frontmatter.rating),
      timestamp: Number(frontmatter.timestamp),
      comment: body.trim(),
      commentHtml: htmlContent,
      product_id: frontmatter.product_id || null,
      verified: Boolean(frontmatter.verified),
      location: frontmatter.location || null,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      metadata: {
        filename,
        processed_at: new Date().toISOString(),
        ...frontmatter.metadata
      }
    };
  }

  validateReviews(reviews) {
    // Verificar duplicatas por timestamp
    const timestamps = reviews.map(r => r.timestamp);
    const duplicates = timestamps.filter((t, i) => timestamps.indexOf(t) !== i);
    
    if (duplicates.length > 0) {
      console.warn(`⚠️ ${duplicates.length} timestamps duplicados encontrados`);
      this.stats.warnings++;
    }

    // Verificar ratings válidos
    const invalidRatings = reviews.filter(r => r.rating < 1 || r.rating > 5);
    if (invalidRatings.length > 0) {
      throw new Error(`${invalidRatings.length} reviews com rating inválido`);
    }
  }

  async saveReviews(reviews) {
    // Ordenar por timestamp (mais recente primeiro)
    reviews.sort((a, b) => b.timestamp - a.timestamp);
    
    // Criar diretório se não existir
    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Salvar JSON formatado
    const jsonContent = JSON.stringify(reviews, null, 2);
    fs.writeFileSync(this.outputFile, jsonContent, 'utf8');
    
    console.log(`💾 ${reviews.length} reviews salvos em reviews.json`);
  }

  async restoreBackup() {
    if (fs.existsSync(this.backupFile)) {
      fs.copyFileSync(this.backupFile, this.outputFile);
      console.log('🔄 Backup restaurado');
    }
  }

  logStats(reviews) {
    console.log('\n📊 Estatísticas do Build:');
    console.log(`   Reviews processados: ${this.stats.processed}`);
    console.log(`   Erros: ${this.stats.errors}`);
    console.log(`   Warnings: ${this.stats.warnings}`);
    console.log(`   Total final: ${reviews.length}`);
    
    if (reviews.length > 0) {
      const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
      console.log(`   Rating médio: ${avgRating}/5`);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  new ReviewBuilder().build();
}

module.exports = ReviewBuilder;
