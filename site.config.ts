import siteConfig from "./src/utils/config";

const config = siteConfig({
	title: "cinnes",
	prologue: "",
	author: {
		name: "cinnes",
		email: "hello@cinnes.dev",
		link: "https://cinnes.github.io"
	},
	description: "A blog about functional programming concepts explained simply and professionally.",
	copyright: {
		type: "CC BY-NC-ND 4.0",
		year: "2025"
	},
	i18n: {
		locales: ["en"],
		defaultLocale: "en"
	},
	feed: {
		section: "*",
		limit: 20
	},
	latest: "*"
});

export const monolocale = Number(config.i18n.locales.length) === 1;

export default config;
