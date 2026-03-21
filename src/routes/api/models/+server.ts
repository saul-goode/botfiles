import { json } from '@sveltejs/kit';
import { getModels } from '$lib/models';

export function GET() {
	return json(getModels(), {
		headers: {
			'Cache-Control': 'public, max-age=86400'
		}
	});
}
