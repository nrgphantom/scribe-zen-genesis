
async function callOpenRouter(prompt: string, systemPrompt?: string, apiKey?: string) {
  console.log("Making API call to: deepseek/deepseek-chat");
  
  const key = apiKey || "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";
  
  if (!key) {
    throw new Error("API key not found. Please provide an API key.");
  }
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "ZedScribe"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      }),
    });

    console.log("API Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response received:", data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid API response structure");
    }
    
    let content = data.choices[0].message.content;
    
    // Enhanced text cleaning
    content = content.replace(/\*+/g, ''); // Remove all asterisks
    content = content.replace(/[●○■□▪▫]/g, ''); // Remove bullet symbols
    content = content.replace(/^\s*[-•]\s*/gm, ''); // Remove dash/bullet markers
    content = content.replace(/#{1,6}\s*/g, ''); // Remove markdown headers
    content = content.replace(/\n{3,}/g, '\n\n'); // Max 2 line breaks
    content = content.replace(/_{2,}/g, ''); // Remove multiple underscores
    content = content.replace(/\*{2,}/g, ''); // Remove multiple asterisks (backup)
    content = content.trim();
    
    return content;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

export async function generateBookIdea(bookName?: string, description?: string, apiKey?: string) {
  const prompt = bookName || description 
    ? `Create a comprehensive book concept based on:
       ${bookName ? `Title: ${bookName}` : ''}
       ${description ? `Description: ${description}` : ''}
       
       Provide a complete book idea including:
       - A compelling title (if not provided)
       - Genre and target audience
       - Main premise and themes
       - Chapter outline with 8-12 chapters
       - Key plot points or concepts
       - What makes this book unique
       
       Write in clear, professional prose without asterisks or special symbols. Use proper formatting with bold text where appropriate for headings and emphasis.`
    : `Create an original and compelling book concept including:
       - A unique and marketable title
       - Clear genre and target audience
       - Engaging premise and main themes
       - Detailed chapter outline (8-12 chapters)
       - Key characters or concepts
       - What makes this book special
       
       Write in clear, professional prose without asterisks or special symbols. Use proper formatting with bold text where appropriate for headings and emphasis.`;

  const systemPrompt = "You are a bestselling author and publishing expert. Create detailed, engaging book concepts that would appeal to readers and publishers. Write in clear, professional prose using proper paragraph structure. Do not use asterisks, bullet points, or special formatting symbols. Focus on creating compelling, marketable book ideas with proper text formatting.";
  
  return await callOpenRouter(prompt, systemPrompt, "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");
}

export async function generateBookOutline(title: string, description: string, chapters: number, apiKey?: string) {
  const prompt = `Create a detailed book outline for:
    Title: ${title}
    Description: ${description}
    Number of Chapters: ${chapters}
    
    Provide a comprehensive outline including:
    1. Book summary
    2. Complete chapter breakdown with:
       - Chapter number and descriptive title
       - Detailed chapter summary (3-4 sentences)
       - Key points and objectives
    
    Format each chapter clearly as:
    Chapter 1: [Title]
    [Summary content]
    
    Write in clear, professional prose without asterisks or special symbols. Use proper formatting with bold text where appropriate.`;

  const systemPrompt = "You are a professional book editor and author. Create well-structured, engaging book outlines that follow proper storytelling principles. Write in clear, professional prose. Do not use asterisks, bullet points, or special formatting symbols. Format chapters clearly with numbers and titles.";
  
  return await callOpenRouter(prompt, systemPrompt, "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");
}

export async function generateChapterContent(
  bookTitle: string, 
  chapterTitle: string, 
  chapterNumber: number, 
  bookDescription: string, 
  targetWords: number,
  previousChapters?: string[],
  apiKey?: string
) {
  const contextInfo = previousChapters && previousChapters.length > 0 
    ? `\n\nPrevious chapters context: ${previousChapters.join(". ")}`
    : "";

  const prompt = `Write Chapter ${chapterNumber}: "${chapterTitle}" for the book "${bookTitle}".
    
    Book Description: ${bookDescription}
    Target Word Count: Around ${targetWords} words (flexible, focus on quality and completeness)
    ${contextInfo}
    
    Write engaging, high-quality chapter content that:
    - Flows naturally and maintains consistent style
    - Advances the main themes and narrative
    - Uses proper paragraph structure with good pacing
    - Maintains consistency with previous chapters
    - Uses professional, publishable writing style
    - Aims for approximately ${targetWords} words while prioritizing quality and story flow
    - Uses proper text formatting with bold and italic text where appropriate
    
    Write complete, well-developed content with natural story progression. Use clear, professional prose without asterisks or special symbols.`;

  const systemPrompt = "You are a professional author writing high-quality book content. Write engaging, well-structured chapters with natural, flowing prose. Maintain consistent style and voice throughout. Use proper paragraph breaks and professional structure. Write content that feels like it belongs in a published book. Do not use asterisks, bullet points, or special formatting symbols. Use proper text formatting like bold and italics where appropriate.";
  
  return await callOpenRouter(prompt, systemPrompt, "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");
}
