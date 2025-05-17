import { StorageService } from './types';

export class LocalFileStorageService implements StorageService {
    private _lastModified: Date | null = null;

    constructor(private readonly filePath: string = '/assets/sample.ledger') { }

    async fetchLedgerContent(): Promise<string> {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ledger file: ${response.statusText}`);
            }

            // Update last modified from response headers if available
            const lastModified = response.headers.get('last-modified');
            if (lastModified) {
                this._lastModified = new Date(lastModified);
            }

            return await response.text();
        } catch (error) {
            console.error('Error fetching ledger file:', error);
            throw error;
        }
    }

    get lastModified(): Date | null {
        return this._lastModified;
    }
} 