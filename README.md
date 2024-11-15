# agentglide.ai

> View agentglide live at [agentglide.ai](https://agentglide.ai)

### Google’s new photorealistic 3D map tiles offer brand new experiences for maps on the web

For this year’s hackathon, my goal is to showcase how this new feature could be a great avenue for location discovery and exploration, and to supercharge with AI

<img width="893" alt="Screenshot 2024-11-15 at 16 34 26" src="https://github.com/user-attachments/assets/bd73e580-f01d-4bbc-9d68-a041e8ab0c40">

## The Concept

An AI travel agent that suggests destinations based on your interests, then gives you an immersive fly-around tour of the sites

### We can break it down into three simple steps

- Tell the AI assistant where you’d like to travel
- Select your interests
- Receive a personalized virtual tour of beautiful sites to visit


### So how do we go about building this?   

- When the user first enters the site, let’s entice them with a fly-around of ~10 locations that look breathtaking in 3D


- Next, let’s prompt the user to tell us where they’d like to travel. They can input anything, anywhere, in the language of their choice, Google Gemini will be able to parse it


- Let’s then provide Google Gemini with the inputted destination and selected interests, then prompt it to return a list of personalized recommendations. We want the response to be a structured JSON, so let’s attach a schema to the prompt request


- Once we have a list of destinations, we want to query two relevant API’s for each item in the array. We will first query the Google Places API to get the exact coordinates, description, and images of the site, then we will query the Google Elevation API to know what altitude to offset the camera for each location

- That’s it! We now have everything we need to present a full fly-around tour of the recommended destinations

## Watch the youtube video here:

[![agentglide video](https://img.youtube.com/vi/TXR2k9-XpWs/0.jpg)](https://www.youtube.com/watch?v=TXR2k9-XpWs)
