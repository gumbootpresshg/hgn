import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { hgnBlue: "#173f5f", hgnNavy: "#111111", hgnRed: "#a31d24", ink: "#171717", paper: "#fffefa" } } }, plugins: [] } satisfies Config;
