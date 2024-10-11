import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schema = {
    description: "List of trip destinations",
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        destinationName: {
          type: SchemaType.STRING,
          description: "Name of the destionation",
          nullable: false,
        },
        destinationDescription: {
          type: SchemaType.STRING,
          description: "Description of the destionation",
          nullable: false,
        },
        destinationCoordinatesLatitude: {
          type: SchemaType.NUMBER,
          description: "Latitude coordinate of the destination",
          nullable: false,
        },
        destinationCoordinatesLongitude: {
          type: SchemaType.NUMBER,
          description: "Longitude coordinate of the destination",
          nullable: false,
        },
      },
      required: [
        "destinationName",
        "destinationDescription",
        "destinationCoordinatesLatitude",
        "destinationCoordinatesLongitude",
      ],
    },
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  const activityNames = req.body.activities
    .map((activity: any) => activity.name)
    .join(", ");
  const prompt = `You are an AI travel agent. The user is asked where they would like to travel and what activities they are interested in. Here are the possible activities: Here is what they provided for where: ${req.body.destination} and for activities: ${activityNames}. Based on this information, generate a list of trip destinations. Provide at least 6 destinations with their names, descriptions, and coordinates. Have the destinations be truly unique and interesting, that relate to the user's selected interests. It's ok to put cities, but try to be more creative than that.`;

  const result = await model.generateContent(prompt);
  const resultJSON = JSON.parse(result.response.text());
  res.status(200).json(resultJSON);
}
