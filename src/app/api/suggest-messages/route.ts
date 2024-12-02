import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const prompt =
		"Create al list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These question are for an anonymous social messaging platform, like Qooh.me and should be suitabel for a diverse auience, Avoid personal or sensitive for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For expample, your output should be structured like this: 'What's a hobby you've recently started? || If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
	try {
		const { messages } = await req.json();

		const result = streamText({
			model: openai("gpt-4o"),
			messages,
			prompt,
		});

		return result.toDataStreamResponse();
	} catch (error) {
		if (error instanceof Error) {
			console.error("An surver error occured", error);
		} else {
			console.error("An unexported error occurecd", error);
		}
		// console.error("An unexported error occurecd", error);
	}
}
