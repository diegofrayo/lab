const baseConfig = ["prettier --write", "eslint"];

const lintStaged = {
	"src/**/*.{ts,tsx}": baseConfig,
};

export default lintStaged;
