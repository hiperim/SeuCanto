const Joi = require('joi');
const fs = require('fs');
const path = require('path');

const reviewSchema = Joi.object({
  email: Joi.string().email().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  timestamp: Joi.number().integer().positive().required(),
  product_id: Joi.string().optional(),
  verified: Joi.boolean().default(false),
  location: Joi.string().max(100).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional()
});

function validateReviews() {
  const reviewsDir = path.join(__dirname, '../reviews');
  const files = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.md'));
  
  let errors = 0;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(reviewsDir, file), 'utf8');
      const matter = require('gray-matter');
      const parsed = matter(content);
      
      const { error } = reviewSchema.validate(parsed.data);
      
      if (error) {
        console.error(`${file}: ${error.message}`);
        errors++;
      } else {
        console.log(`${file}: válido`);
      }
      
    } catch (e) {
      console.error(`${file}: erro de parsing - ${e.message}`);
      errors++;
    }
  });
  
  if (errors > 0) {
    console.error(`\n ${errors} arquivo(s) com erro`);
    process.exit(1);
  } else {
    console.log(`\n Todos os ${files.length} arquivos são válidos`);
  }
}

if (require.main === module) {
  validateReviews();
}
