export interface Theme {
	key: string;
	name: string;
	/** Four preview swatches: [bg, surface, primary, accent] */
	swatches: [string, string, string, string];
}

export const THEMES: Theme[] = [
	{
		key: 'default',
		name: 'Ocean Dark',
		swatches: ['#060d18', '#0d1b2a', '#00e5ff', '#f59e0b']
	},
	{
		key: 'catppuccin',
		name: 'Catppuccin',
		swatches: ['#1e1e2e', '#313244', '#cba6f7', '#fab387']
	},
	{
		key: 'tokyo-night',
		name: 'Tokyo Night',
		swatches: ['#1a1b26', '#24283b', '#7aa2f7', '#e0af68']
	},
	{
		key: 'one-dark',
		name: 'One Dark Pro',
		swatches: ['#21252b', '#282c34', '#61afef', '#e5c07b']
	},
	{
		key: 'dracula',
		name: 'Dracula',
		swatches: ['#282a36', '#343746', '#bd93f9', '#ffb86c']
	},
	{
		key: 'ayu',
		name: 'Ayu',
		swatches: ['#0b0e14', '#13161e', '#39bae6', '#ffb454']
	}
];

export const STORAGE_KEY = 'botfil-theme';
