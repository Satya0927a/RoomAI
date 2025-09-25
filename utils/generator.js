const { GoogleGenAI, Modality } = require("@google/genai");
const fs = require("node:fs");

async function Generator(inputbuffer,prompt,output) {

  const ai = new GoogleGenAI({});

  // Load the image from the local file system
  // const imagePath = path;
  // const imageData = fs.readFileSync(imagePath);
  const base64Image = inputbuffer;

  // Prepare the content parts
  const contents = [
    { text: `${prompt}

` },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];
  
  // Set responseModalities to include "Image" so the model can generate an image
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: contents,
  });
  for (const part of response.candidates[0].content.parts) {
    // Based on the part type, either show the text or save the image
    if (part.text) {
      console.log("saved");
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      console.log('111111111111111111111');
      
      return buffer
      // fs.writeFileSync(output, buffer);
      console.log("Image generated");
    }
  }
}

// const file = fs.readFileSync('./prompts.json')
// const prompts = JSON.parse(file)
// //checks if filtered image exists
// const filteredImageExists = fs.existsSync('./filtered.png');

// if(!filteredImageExists){
//   const img_path = './image.jpg'
//   main(img_path,prompts.REMOVER.join(' '),'filtered.png');
// }
// else{
//   for (let i = 0; i < 5; i++) {
//     console.log('filter exists');
//     const img_path = './filtered.png'
//     const output = `render${i+1}.png`
//     const key = `BED_${2}`
//     const prompt =  prompts[key].join(' ')
//     main(img_path, prompt,output)
//   }
// }

module.exports = Generator