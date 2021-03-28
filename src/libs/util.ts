export function sleep(second = 1): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, second * 1000);
	});
}


export function getFolderImages(hash: string, deep = 10): string {
	return `/${[...new Array(deep).values()].map((_, index) => hash[index]).join('/')}`;
}
