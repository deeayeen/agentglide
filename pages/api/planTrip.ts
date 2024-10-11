// planTrip.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

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
          description: "Name of the destination",
          nullable: false,
        },
        destinationDescription: {
          type: SchemaType.STRING,
          description: "Description of the destination",
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
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const activityNames = req.body.activities
    .map((activity: any) => activity.name)
    .join(", ");
  const prompt = `You are an AI travel agent. The user is asked where they would like to travel and what activities they are interested in. Here are the possible activities: Here is what they provided for where: ${req.body.destination} and for activities: ${activityNames}. Based on this information, generate a list of trip destinations. Provide at least 6 destinations with their names, descriptions, and coordinates. Have the destinations be truly unique and interesting, that relate to the user's selected interests. It's ok to put cities, but try to be more creative than that.`;

  try {
    const result = await model.generateContent(prompt);
    const resultText = await result.response.text();
    const resultJSON = JSON.parse(resultText);

    // Now, loop through each destination and fetch additional data from the Places API
    const augmentedDestinations = await Promise.all(
      resultJSON.map(async (destination: any) => {
        const placeDetails = await getPlaceDetails(destination.destinationName);

        // If placeDetails is found, attach additional data
        if (placeDetails) {
          destination.placeId = placeDetails.place_id;
          destination.address = placeDetails.formatted_address;
          destination.photos = placeDetails.photos || [];
          destination.rating = placeDetails.rating;
          destination.types = placeDetails.types;
          destination.website = placeDetails.website;
          destination.opening_hours = placeDetails.opening_hours;
          destination.geometry = placeDetails.geometry;

          // If coordinates are missing or need to be updated
          if (placeDetails.geometry && placeDetails.geometry.location) {
            destination.destinationCoordinatesLatitude =
              placeDetails.geometry.location.lat;
            destination.destinationCoordinatesLongitude =
              placeDetails.geometry.location.lng;
          }

          // Get elevation data
          const elevation = await getElevation(
            destination.destinationCoordinatesLatitude,
            destination.destinationCoordinatesLongitude
          );
          destination.elevation = elevation;
        }

        return destination;
      })
    );

    res.status(200).json(augmentedDestinations);
  } catch (error) {
    console.error("Error in planTrip handler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Function to get place details from the Places API
async function getPlaceDetails(placeName: string) {
  try {
    // Use Places Text Search API to find the place
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      placeName
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const textSearchResponse = await fetch(textSearchUrl);
    const textSearchData = await textSearchResponse.json();

    if (
      textSearchData.status === "OK" &&
      textSearchData.results &&
      textSearchData.results.length > 0
    ) {
      const placeId = textSearchData.results[0].place_id;

      // Now get detailed information using Place Details API
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=place_id,name,formatted_address,geometry,photos,types,rating,website,opening_hours`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status === "OK" && detailsData.result) {
        return detailsData.result;
      }
    }

    console.warn(`No details found for place: ${placeName}`);
    return null;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

// Function to get elevation data from the Elevation API
async function getElevation(lat: number, lng: number) {
  try {
    const elevationUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    const elevationResponse = await fetch(elevationUrl);
    const elevationData = await elevationResponse.json();

    if (
      elevationData.status === "OK" &&
      elevationData.results &&
      elevationData.results.length > 0
    ) {
      return elevationData.results[0].elevation;
    }

    console.warn(`No elevation data found for coordinates: ${lat}, ${lng}`);
    return null;
  } catch (error) {
    console.error("Error fetching elevation data:", error);
    return null;
  }
}
