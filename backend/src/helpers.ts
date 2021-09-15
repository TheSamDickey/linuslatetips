export const jsonResponse = <T = unknown>(o: T, init?: ResponseInit & { headers?: Record<string, string> }): Response => {
	if (o === undefined) throw new Error("Attempted to respond with object of type undefined");
	if (init !== undefined) {
		if (init.headers === undefined) init.headers = {};
		else init.headers["Content-Type"] = "application/json";
	}
	return new Response(JSON.stringify(o), { ...init });
};

export const Error400 = () => new Response("400, Bad Request!", { status: 400 });
export const Error403 = () => new Response("403, Forbidden!", { status: 403 });
export const Ok200 = () => new Response("200, OK!", { status: 200 });
