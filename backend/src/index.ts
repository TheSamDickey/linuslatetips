import { Router } from "itty-router";
import stream from "stream";
const router = Router();

import { jsonResponse, Error403, Ok200 } from "./helpers";

const encoder = new TextEncoder();

interface EnvInterface {
	TwitchInfo: KVNamespace;
	TwitchMessageIds: KVNamespace;
	twitchsecret: string;
}

// Twitch Code
const buf2hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
const validateSignature = async (req: Request, env: EnvInterface) => {
	// Make sure timestamp isnt older than 10 minutes
	const timestamp = req.headers.get("twitch-eventsub-message-timestamp") || "";
	if (new Date(timestamp).getTime() < Date.now() - 1000 * 60 * 10) return Error403();

	// Make sure we havent seen this message id before
	const messageId = req.headers.get("twitch-eventsub-message-id") || "";
	if ((await env.TwitchMessageIds.get(messageId)) !== null) return new Response();
	await env.TwitchMessageIds.put(messageId, "");

	// Verify message signature
	const [algo, messageSignature] = (req.headers.get("twitch-eventsub-message-signature") || "").split("=");
	const payload = messageId + timestamp + (await req.clone().text());
	const twitchSecretKey = await crypto.subtle.importKey("raw", encoder.encode(env.twitchsecret), { name: "HMAC", hash: "SHA-256" }, false, ["verify", "sign"]);
	const calculatedSignature = buf2hex(await crypto.subtle.sign("HMAC", twitchSecretKey, encoder.encode(payload)));
	if (calculatedSignature !== messageSignature) return Error403();
};
const subRevoke = async (req: Request, env: EnvInterface) => {
	const requestType = req.headers.get("twitch-eventsub-message-type");
	if (requestType === "revocation") return Ok200();
	if (requestType === "webhook_callback_verification") {
		const { challenge } = await req.json();
		return new Response(challenge);
	}
};
type ChannelUpdateEvent = {
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
	title: string;
	language: string;
	category_id: string;
	category_name: string;
	is_mature: false;
};
type StreamOnlineEvent = {
	id: string;
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
	type: string;
	started_at: string;
};
type StreamOfflineEvent = {
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
};
type StreamCategory = {
	id: string;
	name: string;
	updatedAt: number;
};
type StreamTitle = {
	value: string;
	updatedAt: number;
};
type StreamInfo = {
	id: string;
	wasLive: boolean;
	startedAt?: number;
	titles?: StreamTitle[];
	type?: string;
	categories?: StreamCategory[];
	endedAt?: number;
};
const setEvent = (type: "update" | "online" | "offline") => async (req: Request, env: EnvInterface) => {
	let { event }: { event: ChannelUpdateEvent | StreamOnlineEvent | StreamOfflineEvent } = await req.json();

	// Store the raw event
	const stringyEvent = JSON.stringify(event);
	await env.TwitchInfo.put(`${type}:${Date.now()}`, stringyEvent);
	await env.TwitchInfo.put(`${type}:latest`, stringyEvent);

	let latest: string | null = await env.TwitchInfo.get("latest");
	let streamInfo: StreamInfo;
	if (latest === null) streamInfo = { id: "-1", wasLive: false };
	else streamInfo = JSON.parse(latest);

	if (type === "update") {
		// Set title
		const title = {
			value: (<ChannelUpdateEvent>event).title,
			updatedAt: Date.now(),
		};
		streamInfo.titles ??= [title];
		streamInfo.titles.push(title);

		// Set category
		const category: StreamCategory = {
			id: (<ChannelUpdateEvent>event).category_id,
			name: (<ChannelUpdateEvent>event).category_name,
			updatedAt: Date.now(),
		};
		streamInfo.categories ??= [category];
		streamInfo.categories.push(category);
	} else if (type === "online") {
		streamInfo.type = (<StreamOnlineEvent>event).type;
		streamInfo.startedAt = new Date((<StreamOnlineEvent>event).started_at).getTime();
		streamInfo.id = (<StreamOnlineEvent>event).id;
		streamInfo.wasLive = true;
	} else if (type === "offline") {
		streamInfo.endedAt = Date.now();
	}
	const stringyStreamInfo = JSON.stringify(streamInfo);
	// Update the current stream
	await env.TwitchInfo.put(`stream:${streamInfo.id}`, stringyStreamInfo);

	// If the stream has gone offline then set the latest to a new offline stream
	if (streamInfo.endedAt !== undefined) {
		const newOfflineStream = JSON.stringify({ id: `${streamInfo.id}_offline`, wasLive: false });
		await env.TwitchInfo.put("latest", newOfflineStream);
	} else await env.TwitchInfo.put("latest", stringyStreamInfo);

	return new Response();
};
router.post("/webhooks/linustech/online", validateSignature, subRevoke, setEvent("online"));
router.post("/webhooks/linustech/offline", validateSignature, subRevoke, setEvent("offline"));
router.post("/webhooks/linustech/update", validateSignature, subRevoke, setEvent("update"));

// Api Code
router.get("/api/v1/latest", async (req: Request, env: EnvInterface) => new Response(await env.TwitchInfo.get("latest")));

router.all("*", () => new Response("404, Not Found!", { status: 404 }));
export default {
	fetch: router.handle,
};
