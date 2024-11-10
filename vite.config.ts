import type { UserConfig } from 'vite';
import varhubBundlePlugin from "@flinbein/rollup-plugin-varhub-bundle";

export default {
	root: "./src",
	plugins: [varhubBundlePlugin()],
} satisfies UserConfig
