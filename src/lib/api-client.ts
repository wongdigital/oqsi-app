import { InnieRequest, WellnessFactResponse } from './api-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not set. Please configure it with your API endpoint.');
}

export async function generateWellnessFacts(request: InnieRequest): Promise<WellnessFactResponse> {
    console.log('API call made at:', new Date().toISOString());
    try {
        const response = await fetch(`${API_BASE_URL}/generate-facts`, {
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
        throw new Error('Failed to fetch wellness facts. Please check your internet connection and try again.');
    }
} 