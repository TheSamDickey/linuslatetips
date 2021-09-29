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


// We support the GET, POST, HEAD, and OPTIONS methods from any origin,
// and accept the Content-Type header on requests. These headers must be
// present on all responses to all CORS requests. In practice, this means
// all responses to OPTIONS or POST requests.
export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS,POST,DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

export const patchResponse = (response: Response) => {
    for (const [headerName, headerValue] of Object.entries(corsHeaders)) response.headers.set(headerName, headerValue);
    return response;
};
export const OPTIONS = (request: Request) => {
    if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
    ) {
        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: corsHeaders,
        });
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                Allow: corsHeaders["Access-Control-Allow-Methods"],
            },
        });
    }
};