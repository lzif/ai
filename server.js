import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from 'morgan';
import compression from 'compression';
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { minify } from "html-minifier";
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(
  cors({
    origin: "http:///localhost:9999",
  }),
);
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const buildGoogleGenAIPrompt = (messages) => ({
  contents: messages
    .filter(
      (message) => message.role === "user" || message.role === "assistant",
    )
    .map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    })),
});

app.post("/ai", async function (req, res, next) {
  const messages = req.body;

  const generationConfig = {
    maxOutputTokens: 8000,
  };
  const geminiStream = await genAI
    .getGenerativeModel({ model: "gemini-pro", generationConfig })
    .generateContentStream(buildGoogleGenAIPrompt(messages));

  const result = geminiStream;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  for await (const chunk of result.stream) {
    const text = await chunk.text();
    res.write(text);
  }
  res.end();
});

app.get("/", (req, res) => {
  const fileContent = readFileSync("./index.html", "utf8");
  const html = minify(fileContent, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
  });
  res.send(html);
});

let port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
