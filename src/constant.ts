export const SERVER_PORT = process.env.SERVER_PORT ?? 3000;

export const DB_HOST = process.env.DB_HOST || '127.0.0.1';
export const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
export const DB_DATABASE = process.env.DB_DATABASE || 'yandex-video-cover';
export const DB_USERNAME = process.env.DB_USERNAME || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const PROD = process.env.PROD === 'true';
