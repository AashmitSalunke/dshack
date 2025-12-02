// geminiAI.js
// This module uses the @google/generative-ai package to analyze images using Google Gemini Vision API.
// Make sure to set your Gemini API key in the environment variable GEMINI_API_KEY.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable not set.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Analyze an image using Google Gemini Vision API.
 * @param {string} imagePath - Path to the image file (absolute or relative).
 * @returns {Promise<string>} - The analysis result as a string.
 */
async function analyzeImage(imagePath) {
  // Read image as base64
  const absPath = path.isAbsolute(imagePath) ? imagePath : path.join(__dirname, imagePath);
  const imageBuffer = fs.readFileSync(absPath);
  const imageBase64 = imageBuffer.toString('base64');

  // Use Gemini Vision API
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: 'Describe the content of this image.' }
        ]
      }
    ]
  });

  // Extract and return the text
  return result.response.text();
}

module.exports = { analyzeImage };