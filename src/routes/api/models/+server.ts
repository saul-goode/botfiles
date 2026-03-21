import { json } from '@sveltejs/kit';
import { fetchModels } from '$lib/models';

export async function GET() {
	const models = await fetchModels();
	return json(models, {
		headers: {
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
