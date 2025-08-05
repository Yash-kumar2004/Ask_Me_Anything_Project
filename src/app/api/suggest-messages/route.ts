// src/app/api/suggest-messages/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'edge'; // For better streaming

export async function POST(req: Request) {
  try {
    const prompt = `
Create a fresh and original list of three open-ended, engaging, and unique questions formatted as a single string. Ensure these are different from typical questions, and avoid repeating commonly used ones. Separate each with '||'. These questions are for an anonymous social messaging platform and should spark fun and inclusive conversations. Example output: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContentStream([prompt]);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Error in Gemini streaming API:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}













// import { openai } from '@ai-sdk/openai';
// import { streamText } from 'ai';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;


// export async function POST(req: Request) {
//   try {
//     console.log("Received POST request");
//     const prompt =
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
    
//        console.log("Prompt created");

//   const result = await streamText({
//     model: openai('gpt-3.5-turbo'),
//     prompt,
//   });

//    console.log("Got result from OpenAI");

//   return result.toDataStreamResponse();
//   } catch (error) {
//     console.error('An unexpected error occurred:', error);
//     return new Response('Internal Server Error', { status: 500 });
//   }
// }

// export async function POST() {
//   return new Response("API route is working!", { status: 200 });
// }









// export async function POST(req: Request) {
//   try {
//     const prompt = `
// Create a fresh and original list of three open-ended, engaging, and unique questions formatted as a single string. Ensure these are **different** from typical questions, and avoid repeating commonly used ones. Separate each with '||'. These questions are for an anonymous social messaging platform and should spark fun and inclusive conversations. Example output: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'
// `;


//     const response = await fetch(
//       'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contents: [{ parts: [{ text: prompt }] }]
//         })
//       }
//     );

//     const data = await response.json();
//     const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';

//     return Response.json({ text });
//   } catch (err) {
//     console.error('Error in API:', err);
//     return new Response('Internal Server Error', { status: 500 });
//   }
// }
