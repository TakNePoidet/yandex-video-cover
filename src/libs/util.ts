import gm from 'gm';
import sharp from 'sharp';
import { ISizeImage } from '../interface';

export function sleep(second = 1): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, second * 1000);
	});
}

export function getFolderImages(hash: string, deep = 10): string {
	return `${[...new Array(deep).values()].map((_, index) => hash[index]).join('/')}`;
}

export async function getImageSize(filepath: string): Promise<ISizeImage> {
	return new Promise((resolve) => {
		gm(filepath).size((error: Error | null, val: ISizeImage) => {
			if (!error) {
				resolve(val);
			} else {
				throw error;
			}
		});
	});
}

interface Params {
	quality: number;
	progressive: boolean;
	size?: {
		width?: number;
		height?: number;
	};
	format: 'jpg' | 'png' | 'webp';
}
export function parseFormat(paramsRaw: string): Params {
	const params = paramsRaw
		.split(/\/-\//)
		.map((string: string) => {
			const [key, value] = string.split('/');

			return [key, value];
		})
		.filter(([key]) => ['scale_crop', 'format', 'quality'].includes(key))
		.map(([key, value]) => {
			if (key === 'scale_crop') {
				const [width, height] = value.split('x').map((size) => (size ? parseInt(size, 10) : null));

				return ['size', { width, height }];
			}
			if (key === 'format') {
				return [key, value];
			}
			if (key === 'quality') {
				return [key, parseInt(value, 10) ?? 100];
			}

			return [key, value];
		});

	return {
		quality: 100,
		progressive: false,
		format: 'jpg',
		// @ts-ignore
		...Object.fromEntries(params)
	};
}

export function setParamsFromSharp(instance: sharp.Sharp, params: Params): sharp.Sharp {
	if (params.size) {
		instance.resize(params.size);
	}

	instance.toFormat(params.format, {
		quality: params.quality,
		progressive: params.progressive
	});

	return instance;
}

export function sortKeysObject<T extends Record<string, any>>(obj: T): T {
	const newObj: Record<string, any> = {};

	Object.keys(obj)
		.sort()
		.forEach((key) => {
			newObj[key] = obj[key];
		});
	return newObj as T;
}
