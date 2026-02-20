/**
 * Instance configuration loader.
 * Loads buddy.config.ts with a try/catch fallback to sensible defaults.
 * The config file is gitignored — each instance customizes their own.
 */

/** Shape of the buddy.config.ts export. */
export interface BuddyConfig {
	instance: {
		name: string;
		accent: "indigo" | "blue" | "emerald" | "amber" | "rose" | "violet";
	};
	persona: {
		name: string;
		tone: "professional" | "casual" | "concise";
		greeting: string;
		boundaries: string[];
	};
	r2: {
		bucket: string;
		publicUrl: string;
	};
}

const DEFAULT_CONFIG: BuddyConfig = {
	instance: {
		name: "my-buddy",
		accent: "indigo",
	},
	persona: {
		name: "Buddy",
		tone: "professional",
		greeting: "Hey, ready to get to work.",
		boundaries: [
			"Never modify .git/ or node_modules/",
			"Always confirm before deleting content files",
		],
	},
	r2: {
		bucket: "my-buddy-files",
		publicUrl: "https://pub-xxx.r2.dev",
	},
};

/**
 * Load the instance configuration.
 * Falls back to defaults when buddy.config.ts is missing or malformed.
 *
 * WHY: We use @vite-ignore on the dynamic import so Rollup doesn't try to
 * resolve the file at build time. The config file is gitignored and may
 * not exist — the try/catch handles that gracefully.
 */
export async function loadConfig(): Promise<BuddyConfig> {
	try {
		const configPath = "../../buddy.config.ts";
		const mod = await import(/* @vite-ignore */ configPath);
		const raw = mod.default ?? mod;
		return {
			instance: { ...DEFAULT_CONFIG.instance, ...raw.instance },
			persona: { ...DEFAULT_CONFIG.persona, ...raw.persona },
			r2: { ...DEFAULT_CONFIG.r2, ...raw.r2 },
		};
	} catch {
		return DEFAULT_CONFIG;
	}
}
