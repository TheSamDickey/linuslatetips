const spawnTime = Date.now();

export interface EnvInterface {
	ENVIRONMENT: string;
}

export default {
	async fetch(request: Request, env: EnvInterface): Promise<Response> {
		return new Response("Hello!");
	},
};
