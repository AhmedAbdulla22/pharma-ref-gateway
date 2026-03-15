import { createGoogleGenerativeAI } from '@ai-sdk/google';
import Groq from "groq-sdk";
import SambaNova from 'sambanova';

interface APIProvider {
  name: string;
  client: any;
  isAvailable: boolean;
  failureCount: number;
  lastFailureTime?: number;
}

class APIProviderManager {
  private providers: APIProvider[] = [];
  private failureThreshold = 3;
  private cooldownTime = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize Gemini (Google AI) - First priority
    const googleAI = process.env.GOOGLE_AI_API_KEY ? createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    }) : null;

    if (googleAI) {
      this.providers.push({
        name: 'gemini',
        client: googleAI,
        isAvailable: true,
        failureCount: 0
      });
    }

    // Initialize Groq Main - Second priority
    const groqMain = process.env.GROQ_API_KEY ? new Groq({ 
      apiKey: process.env.GROQ_API_KEY 
    }) : null;

    if (groqMain) {
      this.providers.push({
        name: 'groq-main',
        client: groqMain,
        isAvailable: true,
        failureCount: 0
      });
    }

    // Initialize Groq Backup 1 - Third priority
    const groqBackup1 = process.env.GROQ_API_BACKUP1_KEY ? new Groq({ 
      apiKey: process.env.GROQ_API_BACKUP1_KEY 
    }) : null;

    if (groqBackup1) {
      this.providers.push({
        name: 'groq-backup1',
        client: groqBackup1,
        isAvailable: true,
        failureCount: 0
      });
    }

    // Initialize Groq Backup 2 - Fourth priority
    const groqBackup2 = process.env.GROQ_API_BACKUP2_KEY ? new Groq({ 
      apiKey: process.env.GROQ_API_BACKUP2_KEY 
    }) : null;

    if (groqBackup2) {
      this.providers.push({
        name: 'groq-backup2',
        client: groqBackup2,
        isAvailable: true,
        failureCount: 0
      });
    }

    // Initialize SambaNova - Last priority
    const sambaNova = process.env.SAMBA_NOVA_API_KEY ? new SambaNova({ 
      apiKey: process.env.SAMBA_NOVA_API_KEY 
    }) : null;

    if (sambaNova) {
      this.providers.push({
        name: 'sambanova',
        client: sambaNova,
        isAvailable: true,
        failureCount: 0
      });
    }

    console.log(`Initialized ${this.providers.length} API providers:`, 
      this.providers.map(p => p.name).join(', '));
  }

  private checkCooldown(provider: APIProvider): boolean {
    if (!provider.lastFailureTime) return false;
    return Date.now() - provider.lastFailureTime < this.cooldownTime;
  }

  private markFailure(provider: APIProvider) {
    provider.failureCount++;
    provider.lastFailureTime = Date.now();
    
    if (provider.failureCount >= this.failureThreshold) {
      provider.isAvailable = false;
      console.log(`Provider ${provider.name} marked as unavailable after ${provider.failureCount} failures`);
    }
  }

  private markSuccess(provider: APIProvider) {
    if (provider.failureCount > 0) {
      console.log(`Provider ${provider.name} recovered after previous failures`);
    }
    provider.failureCount = 0;
    provider.lastFailureTime = undefined;
    provider.isAvailable = true;
  }

  getAvailableProvider(): APIProvider | null {
    // Reset providers that are in cooldown but should be available again
    for (const provider of this.providers) {
      if (!provider.isAvailable && this.checkCooldown(provider)) {
        if (Date.now() - (provider.lastFailureTime || 0) >= this.cooldownTime) {
          provider.isAvailable = true;
          provider.failureCount = 0;
          provider.lastFailureTime = undefined;
          console.log(`Provider ${provider.name} cooldown ended, marked as available`);
        }
      }
    }

    // Find first available provider
    const availableProvider = this.providers.find(p => p.isAvailable && !this.checkCooldown(p));
    
    if (!availableProvider) {
      console.warn('No available API providers');
      return null;
    }

    return availableProvider;
  }

  async executeWithFallback<T>(
    operation: (provider: APIProvider) => Promise<T>,
    context: string = 'AI operation'
  ): Promise<T> {
    let lastError: Error | null = null;
    let attemptedProviders: string[] = [];

    for (let attempt = 0; attempt < this.providers.length; attempt++) {
      const provider = this.getAvailableProvider();
      
      if (!provider) {
        break;
      }

      if (attemptedProviders.includes(provider.name)) {
        continue; // Skip providers we already tried
      }

      attemptedProviders.push(provider.name);
      
      try {
        console.log(`Attempting ${context} with provider: ${provider.name}`);
        const result = await operation(provider);
        this.markSuccess(provider);
        console.log(`Success with ${provider.name} for ${context}`);
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`Failure with ${provider.name} for ${context}:`, error.message);
        this.markFailure(provider);
        
        // If it's a rate limit or quota error, mark as unavailable immediately
        if (error.message?.includes('rate limit') || 
            error.message?.includes('quota') || 
            error.message?.includes('429')) {
          provider.isAvailable = false;
          console.log(`Provider ${provider.name} immediately marked unavailable due to rate limiting`);
        }
      }
    }

    throw lastError || new Error(`All providers failed for ${context}. Attempted: ${attemptedProviders.join(', ')}`);
  }

  getProviderStatus() {
    return this.providers.map(p => ({
      name: p.name,
      available: p.isAvailable && !this.checkCooldown(p),
      failures: p.failureCount,
      lastFailure: p.lastFailureTime ? new Date(p.lastFailureTime).toISOString() : null
    }));
  }

  // Specific methods for different types of operations
  async generateText(messages: any[], options: any = {}) {
    return this.executeWithFallback(async (provider) => {
      if (provider.name === 'gemini') {
        const model = provider.client('gemini-1.5-flash');
        const result = await model.generateText({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: options.temperature || 0.3,
          maxTokens: options.max_tokens || 1000,
        });
        return {
          choices: [{
            message: { content: result.text }
          }]
        };
      } else if (provider.name.startsWith('groq')) {
        const result = await provider.client.chat.completions.create({
          messages,
          model: options.model || "llama-3.3-70b-versatile",
          temperature: options.temperature || 0.3,
          max_tokens: options.max_tokens || 1000,
          response_format: options.response_format
        });
        return result;
      } else if (provider.name === 'sambanova') {
        const result = await provider.client.chat.completions.create({
          messages,
          model: options.model || "Meta-Llama-3.1-8B-Instruct",
          temperature: options.temperature || 0.3,
          response_format: options.response_format
        });
        return result;
      }
      throw new Error(`Unknown provider: ${provider.name}`);
    }, 'text generation');
  }
}

// Singleton instance
export const apiManager = new APIProviderManager();
