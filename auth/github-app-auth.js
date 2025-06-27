class GitHubAppAuth {
  constructor() {
    // SUBSTITUA PELOS SEUS VALORES REAIS DO GITHUB APP
    this.config = {
      clientId: 'SEU_CLIENT_ID_AQUI',      // Ex: Iv1.abcd1234efgh5678
      appId: 'SEU_APP_ID_AQUI',            // Ex: 123456  
      installationId: 'SEU_INSTALLATION_ID_AQUI', // Ex: 12345678
      scope: 'repo',
      redirectUri: window.location.origin + '/auth/callback'
    };
    
    this.state = this.generateState();
    this.token = null;
    this.init();
  }

  init() {
    // Verificar se está retornando do callback OAuth
    if (window.location.pathname === '/auth/callback') {
      this.handleOAuthCallback();
    }
    
    // Verificar token existente
    this.loadStoredToken();
  }

  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  loadStoredToken() {
    try {
      const stored = sessionStorage.getItem('github_app_token');
      if (stored) {
        const tokenData = JSON.parse(stored);
        if (tokenData.expires > Date.now()) {
          this.token = tokenData.token;
          console.log('✅ Token válido encontrado');
          return true;
        } else {
          sessionStorage.removeItem('github_app_token');
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar token armazenado:', e);
    }
    return false;
  }

  storeToken(token, expiresIn = 3600) {
    try {
      const tokenData = {
        token: token,
        expires: Date.now() + (expiresIn * 1000)
      };
      sessionStorage.setItem('github_app_token', JSON.stringify(tokenData));
      this.token = token;
    } catch (e) {
      console.error('Erro ao armazenar token:', e);
    }
  }

  async authenticateUser() {
    if (this.token) {
      return this.token;
    }

    return new Promise((resolve, reject) => {
      // Armazenar funções de resolve/reject para callback
      window.githubAuthResolve = resolve;
      window.githubAuthReject = reject;
      
      // Armazenar state para segurança
      sessionStorage.setItem('github_oauth_state', this.state);
      
      const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${this.config.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.config.redirectUri)}&` +
        `scope=${this.config.scope}&` +
        `state=${this.state}`;
      
      // Abrir popup para OAuth
      const popup = window.open(authUrl, 'github-auth', 'width=600,height=700');
      
      // Verificar se popup foi fechado manualmente
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Autenticação cancelada'));
        }
      }, 1000);
    });
  }

  async createReviewFile(reviewData) {
    let token = this.token;
    
    if (!token) {
      token = await this.authenticateUser();
    }

    const slug = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const content = this.generateMarkdownContent(reviewData);
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    const response = await fetch(
      `https://api.github.com/repos/hiperim/SeuCanto/contents/reviews/${slug}.md`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          message: `feat: adiciona review de ${reviewData.author}`,
          content: base64Content,
          branch: 'reviews_branch'
        })
      }
    );

    if (response.status === 401) {
      this.clearToken();
      throw new Error('Token expirado. Tente novamente.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  generateMarkdownContent(review) {
    const timestamp = Date.now();
    const tags = review.tags && review.tags.length > 0
      ? review.tags.map(t => `"${t}"`).join(', ')
      : '"review"';

    return `---
    author: "${review.email.split('@')[0]}" 
    email: "${review.email || 'não informado'}"
    rating: ${review.rating}
    timestamp: ${timestamp}
    product_id: "${review.productId || 'geral'}"
    verified: false
    location: "${review.location || 'Brasil'}"
    tags: [${tags}]
    ---

    ${review.comment}`;
      }

  clearToken() {
    this.token = null;
    sessionStorage.removeItem('github_app_token');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Exportar para uso no app principal
window.GitHubAppAuth = GitHubAppAuth;
