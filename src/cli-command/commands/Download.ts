import axios from 'axios';
import { Command } from 'console-commander';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import sharp from 'sharp';
import { getFolderImages, sleep } from '../../libs/util';
import { database } from '../database';

interface QueueItem {
	id: number;
	data: string;
	status: number;
}

interface QueueItemData {
	videoId: number;
	images: string;
}
export class Download extends Command {
	public signature = 'download {--loop}';

	public description = 'Скачивание картинки с яндекса';

	async handle(): Promise<void> {
		do {
			try {
				database.beginTransaction();
				const queueItems = await database.query<QueueItem[]>('SELECT * FROM `queue` WHERE `status` = 1 LIMIT 1');

				if (queueItems.length < 1) {
					await sleep(5);
					continue;
				}
				const [queue] = queueItems;

				await database.query('UPDATE `queue` SET `status` = 2 WHERE `id` = ?', [queue.id]);
				const data: QueueItemData = JSON.parse(queue.data);
				const videos = await database.query<Array<{ hash: string }>>('SELECT `hash` FROM `video` WHERE `id` = ?', [
					data.videoId
				]);
				const storage = path.resolve(__dirname, '../storage');
				const response = await axios.get(data.images, { responseType: 'arraybuffer' });
				const [video] = videos;

				const folder = getFolderImages(video.hash, 15);

				const image = await sharp(response.data)
					.toFormat('jpg', {
						quality: 100,
						progressive: false
					})
					.toBuffer();
				const filename = `${storage}/original/${folder}/${video.hash}.jpg`;

				mkdirp.sync(`${storage}/original/${folder}`);
				await fs.promises.writeFile(filename, image);

				await database.query('UPDATE `images` SET `path` = ?, `file` = ?  WHERE `video_id` = ?', [
					folder,
					`${video.hash}.png`,
					data.videoId
				]);
				await database.query('DELETE FROM `queue` WHERE `id` = ?', [queue.id]);

				database.commit();
			} catch (error) {
				console.log(error.message);
				database.rollback();
			}
		} while (this.options.loop);
	}
}
