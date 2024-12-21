declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CI: string;
		}
	}
}

export { NodeJS };
