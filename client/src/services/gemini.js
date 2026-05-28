export async function generateAIResume(skills) {
  try {

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=AIzaSyAeK8DSNro6c4M58HnGEkgNeQ8wTWY9OsQ",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a professional resume summary for skills: ${skills}`,
                },
              ],
            },
          ],
        }),
      }
    );

   const data = await response.json();

console.log(data);

if (data.error) {
  return `Frontend developer skilled in ${skills} with strong knowledge in modern web development, responsive UI design, and problem solving.`;
}

return data.candidates[0].content.parts[0].text;
    

  } catch (error) {

    console.log(error);

    return "Failed to Generate AI Summary";
  }
}