import { InnieRequest, WellnessFactResponse } from './api-types';

export async function generateWellnessFacts(request: InnieRequest): Promise<WellnessFactResponse> {
    console.log('API call made at:', new Date().toISOString());
    try {
        const response = await fetch('/api/generate-facts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw new Error('The query failed. The Board may have hung up. Please check your internet connection and try again.');
    }
} 