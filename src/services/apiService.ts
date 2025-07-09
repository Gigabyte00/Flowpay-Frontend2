// Configuration - In production, these would come from environment variables
export const CONFIG = {
  API_BASE_URL: 'http://localhost:4242/api',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51Rg83yR5e4jJ92tPGXX4bvHR3pP56yqppkZ8fiTqEIXwVZTSf0gxoDTc9BRQVoN64tSknjAi7mA3OVCcDjMsWARm00RMldz7DQ',
  DEMO_MODE: true // Set to false when backend is connected
};

// Add global declaration for window.Stripe
declare global {
  interface Window {
    Stripe?: any;
  }
}

export class ApiService {
  async request(endpoint: string, options: any = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    try {
      if (CONFIG.DEMO_MODE) {
        return this.mockResponse(endpoint, options);
      }
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  mockResponse(endpoint, options) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint === '/accounts/create') {
          resolve({
            success: true,
            accountId: 'acct_demo_' + Math.random().toString(36).substr(2, 9),
            detailsSubmitted: false,
            chargesEnabled: false,
            payoutsEnabled: false
          });
        } else if (endpoint === '/accounts/onboarding-link') {
          resolve({
            success: true,
            url: 'https://connect.stripe.com/setup/e/acct_demo/demo_onboarding',
            expiresAt: Date.now() + 3600000
          });
        } else if (endpoint.startsWith('/accounts/status/')) {
          resolve({
            success: true,
            account: {
              id: endpoint.split('/').pop(),
              detailsSubmitted: Math.random() > 0.5,
              chargesEnabled: true,
              payoutsEnabled: true
            }
          });
        } else if (endpoint === '/accounts/dashboard-link') {
          resolve({
            success: true,
            url: 'https://dashboard.stripe.com/test/connect/accounts/acct_demo'
          });
        } else if (endpoint === '/payments/create-intent') {
          resolve({
            success: true,
            clientSecret: 'pi_demo_secret_' + Math.random().toString(36).substr(2, 9),
            paymentIntentId: 'pi_demo_' + Math.random().toString(36).substr(2, 9),
            amount: options.body ? JSON.parse(options.body).amount * 100 : 0,
            fee: options.body ? Math.round(JSON.parse(options.body).amount * 3.5) : 0
          });
        } else {
          resolve({ success: true });
        }
      }, 500);
    });
  }
  async createAccount(email, businessName, businessType = 'individual') {
    return this.request('/accounts/create', {
      method: 'POST',
      body: JSON.stringify({ email, businessName, businessType }),
    });
  }
  async getOnboardingLink(accountId) {
    return this.request('/accounts/onboarding-link', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  }
  async getAccountStatus(accountId) {
    return this.request(`/accounts/status/${accountId}`);
  }
  async getDashboardLink(accountId) {
    return this.request('/accounts/dashboard-link', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  }
  async createPaymentIntent(amount, vendorAccountId, description, payoutSpeed) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ 
        amount, 
        vendorAccountId, 
        description, 
        payoutSpeed 
      }),
    });
  }
  async createTransfer(amount, destinationAccountId, paymentIntentId) {
    return this.request('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ 
        amount, 
        destinationAccountId, 
        paymentIntentId 
      }),
    });
  }
}

export const apiService = new ApiService();

export const loadStripe = () => {
  return new Promise((resolve) => {
    if (window.Stripe) {
      resolve(window.Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY));
    } else {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        if (window.Stripe) {
          resolve(window.Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY));
        } else {
          resolve(null);
        }
      };
      document.head.appendChild(script);
    }
  });
}; 