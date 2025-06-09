async function callGeminiAPI(prompt: string, systemPrompt?: string) {
  console.log("Making API call to Google Gemini");
  
  const apiKey = "AIzaSyCxuHt7VN50Z9dJky2HZjV9Z03pUmiKb3Q";
  
  if (!apiKey) {
    throw new Error("Google API key not found");
  }
  
  try {
    console.log("Sending request with prompt:", prompt.substring(0, 100) + "...");
    
    // Combine system prompt and user prompt for Gemini
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser request: ${prompt}` : prompt;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8000,
        }
      }),
    });

    console.log("API Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response received:", data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid API response structure");
    }
    
    let content = data.candidates[0].content.parts[0].text;
    return cleanText(content);
    
  } catch (error) {
    console.error("Gemini API call error:", error);
    throw error;
  }
}

function cleanText(content: string): string {
  // Clean and format the text properly
  content = content.replace(/\*+/g, ''); // Remove asterisks
  content = content.replace(/[●○■□▪▫]/g, ''); // Remove bullet symbols
  content = content.replace(/^\s*[-•]\s*/gm, ''); // Remove dash/bullet markers
  content = content.replace(/#{1,6}\s*/g, ''); // Remove markdown headers
  content = content.replace(/\n{3,}/g, '\n\n'); // Max 2 line breaks
  content = content.replace(/_{2,}/g, ''); // Remove multiple underscores
  content = content.replace(/`{1,3}/g, ''); // Remove code blocks
  content = content.trim();
  
  return content;
}

export async function generateBookIdea(bookName?: string, description?: string, numChapters?: number) {
  console.log("Generating book idea with Google Gemini API");
  
  const chapterInfo = numChapters ? `\nNumber of Chapters: ${numChapters}` : '';
  
  const prompt = bookName || description 
    ? `Create a comprehensive book concept based on the following information:
       ${bookName ? `Book Title: ${bookName}` : ''}
       ${description ? `Book Description: ${description}` : ''}${chapterInfo}
       
       Please provide a complete book idea that includes:
       
       Title: [Compelling title if not already provided]
       Genre: [Genre and target audience]
       Description: [Main premise and central themes in 2-3 paragraphs]
       ${numChapters ? `Chapter Outline: [Brief outline for ${numChapters} chapters]` : 'Chapter Outline: [Brief outline with 8-12 chapters]'}
       Unique Elements: [What makes this book special and marketable]
       
       Write this as a clear, engaging book concept. Use proper paragraph structure and avoid any special formatting symbols.`
    : `Create an original and compelling book concept that includes:
       ${chapterInfo}
       
       Title: [Unique and marketable title]
       Genre: [Clear genre and target audience identification]
       Description: [Engaging premise and main themes in 2-3 paragraphs]
       ${numChapters ? `Chapter Outline: [Brief outline for ${numChapters} chapters]` : 'Chapter Outline: [Brief outline with 8-12 chapters]'}
       Unique Elements: [What makes this book special and different]
       
       Write this as a clear, engaging book concept. Use proper paragraph structure and avoid any special formatting symbols.`;

  const systemPrompt = "You are an experienced bestselling author and publishing expert. Create detailed, engaging book concepts that would appeal to both readers and publishers. Write in clear, professional prose using proper paragraph structure. Focus on creating compelling, marketable book ideas. Do not use asterisks, bullet points, or any special formatting symbols in your response.";
  
  return await callGeminiAPI(prompt, systemPrompt);
}

export async function generateBookOutline(title: string, description: string, chapters: number) {
  console.log("Generating book outline with Google Gemini API");
  
  const prompt = `Create a detailed book outline for the following book:
    
    Book Title: ${title}
    Book Description: ${description}
    Required Number of Chapters: ${chapters}
    
    Please provide a comprehensive outline that includes:
    
    1. A brief book summary (2-3 paragraphs)
    2. Complete chapter breakdown with the following for each chapter:
       - Chapter number and descriptive title
       - Detailed chapter summary (3-4 sentences explaining what happens)
       - Key points and objectives for that chapter
    
    Format each chapter clearly as:
    Chapter 1: [Descriptive Title]
    [Detailed summary content]
    
    Write in clear, professional prose without any special formatting symbols. Make sure each chapter builds logically on the previous ones.`;

  const systemPrompt = "You are a professional book editor and author with extensive experience in creating book outlines. Your task is to create well-structured, engaging book outlines that follow proper storytelling principles and logical progression. Write in clear, professional prose without using asterisks, bullet points, or any special formatting symbols. Format chapters clearly with numbers and descriptive titles.";
  
  return await callGeminiAPI(prompt, systemPrompt);
}

export async function generateChapterContent(
  bookTitle: string, 
  chapterTitle: string, 
  chapterNumber: number, 
  bookDescription: string, 
  targetWords: number,
  previousChapters?: string[]
) {
  console.log("Generating chapter content with Google Gemini API");
  
  const contextInfo = previousChapters && previousChapters.length > 0 
    ? `\n\nContext from previous chapters: ${previousChapters.join(". ")}`
    : "";

  const prompt = `Write Chapter ${chapterNumber} titled "${chapterTitle}" for the book "${bookTitle}".
    
    Book Description: ${bookDescription}
    Target Word Count: Approximately ${targetWords} words (focus on quality and completeness over exact word count)
    ${contextInfo}
    
    Please write engaging, high-quality chapter content that:
    - Flows naturally and maintains a consistent writing style
    - Advances the main themes and narrative of the book
    - Uses proper paragraph structure with good pacing
    - Maintains consistency with any previous chapters
    - Uses a professional, publishable writing style
    - Aims for approximately ${targetWords} words while prioritizing quality and story flow
    - Includes natural dialogue and scene descriptions where appropriate
    
    Write complete, well-developed content with natural story progression. Use clear, professional prose without any special formatting symbols. This should read like a chapter from a published book.`;

  const systemPrompt = "You are a professional author writing high-quality book content. Your task is to write engaging, well-structured chapters with natural, flowing prose. Maintain a consistent style and voice throughout. Use proper paragraph breaks and professional structure. Write content that feels like it belongs in a published book. Do not use asterisks, bullet points, or any special formatting symbols in your writing.";
  
  return await callGeminiAPI(prompt, systemPrompt);
}
