import { apiManager } from '../../../lib/api-provider-manager';

export async function GET() {
  try {
    const status = apiManager.getProviderStatus();
    
    return Response.json({
      status: 'API Manager initialized successfully',
      providers: status,
      fallbackOrder: [
        '1. Gemini (Google AI)',
        '2. Groq Main',
        '3. Groq Backup 1', 
        '4. Groq Backup 2',
        '5. SambaNova'
      ],
      features: [
        'Automatic fallback on failure',
        'Rate limit detection and cooldown',
        'Failure tracking and recovery',
        'Temporary provider disabling'
      ]
    });
  } catch (error: any) {
    return Response.json({
      error: 'Failed to initialize API manager',
      message: error.message
    }, { status: 500 });
  }
}
