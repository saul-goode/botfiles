import { fetchModels } from '$lib/models';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const models = await fetchModels();
	return { models };
};
