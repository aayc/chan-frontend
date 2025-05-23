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

export class ServerStorageService implements StorageService {
    private _lastModified: Date | null = null;

    constructor(
        private readonly baseUrl: string = 'http://localhost:8000',
        private readonly year: number = new Date().getFullYear(),
        private readonly getAuthToken: () => Promise<string | null>
    ) { }

    async fetchLedgerContent(): Promise<string> {
        try {
            const authToken = await this.getAuthToken();
            if (!authToken) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`${this.baseUrl}/ledger/${this.year}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Authentication failed - invalid or expired token');
                } else if (response.status === 404) {
                    throw new Error(`Ledger file not found for year ${this.year}`);
                } else {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
            }

            // Update last modified from response headers if available
            const lastModified = response.headers.get('last-modified');
            if (lastModified) {
                this._lastModified = new Date(lastModified);
            } else {
                // If no last-modified header, use current time as fallback
                this._lastModified = new Date();
            }

            const content = await response.text();
            return content;
        } catch (error) {
            console.error('Error fetching ledger from server:', error);
            throw error;
        }
    }

    get lastModified(): Date | null {
        return this._lastModified;
    }

    // Method to update the year for fetching different ledger files
    setYear(year: number): void {
        if (year !== this.year) {
            (this as any).year = year;
            // Reset last modified when year changes
            this._lastModified = null;
        }
    }

    // Method to get current year
    getYear(): number {
        return this.year;
    }
} 