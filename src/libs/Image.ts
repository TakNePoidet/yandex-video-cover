import sharp from 'sharp';

interface Settings {
	quality: number;
	progressive: boolean;
	size?: {
		width?: number;
		height?: number;
	};
	format: 'jpg' | 'png' | 'webp';
}

export class ImageController {
	public settings: Settings;

	constructor(settings: string) {
		this.settings = ImageController.parseSettings(settings);
	}

	private static parseSettings(srt: string): Settings {
		const params = srt
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

		params.forEach(([key, value]) => {
			ImageController.validate(key.toString(), value);
		});

		return {
			quality: 100,
			progressive: false,
			format: 'jpg',
			// @ts-ignore
			...Object.fromEntries(params)
		};
	}

	public async create(img: string | Buffer): Promise<Buffer> {
		return await this.setParamsFromSharp(sharp(img)).toBuffer();
	}

	private setParamsFromSharp(instance: sharp.Sharp): sharp.Sharp {
		const { settings } = this;

		if (settings.size) {
			instance.resize(settings.size);
		}

		instance.toFormat(settings.format, {
			quality: settings.quality,
			progressive: settings.progressive
		});
		return instance;
	}

	private static validate(key: string, value: any): void {
		if (key === 'quality') {
			if (typeof value !== 'number' || value < 1 || !Number.isFinite(value)) {
				throw new Error('Неверный формат качества');
			}
		}
		if (key === 'format') {
			if (!['jpg', 'png', 'webp'].includes(value.toString())) {
				throw new Error('Неверный тим файла');
			}
		}
	}
}
