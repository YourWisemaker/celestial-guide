declare module 'openrouter' {
  export class Openrouter {
    constructor(options: { apiKey: string });
    
    chat: {
      completions: {
        create(options: {
          model: string;
          messages: Array<{
            role: string;
            content: string;
          }>;
          temperature?: number;
          max_tokens?: number;
        }): Promise<{
          choices: Array<{
            message?: {
              content: string;
            };
          }>;
        }>;
      };
    };
  }
}
