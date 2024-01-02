import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"
dotenv.config()

const API_KEY = process.env.API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

export default async function sendResponseForWebBuilder(newMessage) {
  const generationConfig = {
    maxOutputTokens: 8000,
  };

  const chat = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Create an array JSON from user instructions that can be used with React.createElement(type, props, ...children)",
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Ok" }],
      },
      {
        role: "user",
        parts: [
          {
            text: "Tulis kode arraynya saja seperti ```[ /.../ ]``` . Tanpa '```{json|jsx|etc} ... ```', dan juga aku ingin valid json(key menggunakan string)",
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Baik tuan" }],
      },
    ],
  });

  const result = await chat.sendMessageStream(newMessage);
  const encodedStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of result.stream) {
        const text = await chunk.text();
        const encoded = encoder.encode(text);
        controller.enqueue(encoded);
      }
      controller.close();
    },
  });

  return encodedStream;
}
