import { getModels } from '$lib/models';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { models: getModels() };
};
