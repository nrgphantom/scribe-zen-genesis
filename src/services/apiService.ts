const API_CONFIGS = {
  deepseekR1: {
    key: import.meta.env.VITE_OPENROUTER_DEEPSEEK_KEY,
    model: "deepseek/deepseek-r1-distill-qwen-32b"
  },
  qwen: {
    key: import.meta.env.VITE_OPENROUTER_QWEN_KEY,
    model: "qwen/qwen-2.5-3b-instruct"
  }
};

async function callOpenRouter(apiConfig: any, prompt: string, systemPrompt?: string) {
  console.log("Making API call to:", apiConfig.model);
  
  if (!apiConfig.key) {
    throw new Error("API key not found. Please check your environment variables.");
  }
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiConfig.key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "ZedScribe"
      },
      body: JSON.stringify({
        model: apiConfig.model,
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
      const errorData = await response.text();
      console.error("API Error:", errorData);
      throw new Error(`API call failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log("API Response received");
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }
    
    // Clean up the response text for professional formatting
    let cleanedText = data.choices[0].message.content;
    
    // Remove excessive asterisks and formatting symbols
    cleanedText = cleanedText.replace(/\*{3,}/g, ''); // Remove 3+ asterisks
    cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown but keep text
    cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1'); // Remove italic markdown but keep text
    cleanedText = cleanedText.replace(/[●○■□▪▫]/g, ''); // Remove bullet symbols
    cleanedText = cleanedText.replace(/^\s*[-•]\s*/gm, ''); // Remove dash/bullet list markers
    cleanedText = cleanedText.replace(/#{1,6}\s*/g, ''); // Remove markdown headers but keep text
    
    // Clean up extra whitespace and ensure proper paragraph structure
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n'); // Max 2 line breaks
    cleanedText = cleanedText.trim();
    
    return cleanedText;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

export async function generateBookIdea(bookName?: string, description?: string) {
  const prompt = bookName || description 
    ? `Create a comprehensive book concept based on:
       ${bookName ? `Title: ${bookName}` : ''}
       ${description ? `Description: ${description}` : ''}
       
       Provide a complete book idea including:
       - Compelling title (if not provided)
       - Genre and target audience
       - Main premise and themes
       - Chapter outline with 8-12 chapters
       - Key plot points or concepts
       - Unique selling points
       
       Write in clear, professional prose without special formatting symbols.`
    : `Create an original and compelling book concept including:
       - Unique and marketable title
       - Clear genre and target audience
       - Engaging premise and main themes
       - Detailed chapter outline (8-12 chapters)
       - Key characters or concepts
       - What makes this book special
       
       Write in clear, professional prose without special formatting symbols.`;

  const systemPrompt = "You are a bestselling author and publishing expert. Create detailed, engaging book concepts that would appeal to readers and publishers. Write in clear, professional prose using proper paragraph structure. Do not use asterisks, bullet points, or special formatting symbols. Focus on creating compelling, marketable book ideas with proper narrative structure.";
  
  return await callOpenRouter(API_CONFIGS.qwen, prompt, systemPrompt);
}

export async function generateBookOutline(title: string, description: string, chapters: number) {
  const prompt = `Create a detailed book outline for:
    Title: ${title}
    Description: ${description}
    Number of Chapters: ${chapters}
    
    Provide a comprehensive outline including:
    1. Refined book summary
    2. Complete chapter breakdown with:
       - Chapter number and descriptive title
       - Detailed chapter summary (3-4 sentences)
       - Key points and objectives
       - Connection to overall narrative
    
    Write in clear, professional prose without special formatting symbols. Ensure each chapter builds logically on the previous ones.`;

  const systemPrompt = "You are a professional book editor and author. Create well-structured, engaging book outlines that follow proper storytelling principles. Write in clear, professional prose using proper paragraph structure. Do not use asterisks, bullet points, or special formatting symbols. Focus on creating logical, compelling chapter progressions.";
  
  return await callOpenRouter(API_CONFIGS.deepseekR1, prompt, systemPrompt);
}

export async function generateChapterContent(
  bookTitle: string, 
  chapterTitle: string, 
  chapterNumber: number, 
  bookDescription: string, 
  targetWords: number,
  previousChapters?: string[]
) {
  const contextInfo = previousChapters && previousChapters.length > 0 
    ? `\n\nPrevious chapters context: ${previousChapters.join(". ")}`
    : "";

  const prompt = `Write Chapter ${chapterNumber}: "${chapterTitle}" for the book "${bookTitle}".
    
    Book Description: ${bookDescription}
    Target Word Count: Approximately ${targetWords} words
    ${contextInfo}
    
    Write engaging, high-quality chapter content that:
    - Flows naturally and maintains consistent style
    - Advances the main themes and narrative
    - Includes proper paragraph structure with good pacing
    - Maintains consistency with previous chapters
    - Uses professional, publishable writing style
    - Targets approximately ${targetWords} words while prioritizing quality
    
    Write complete, well-developed content with proper story progression. Use clear, professional prose without special formatting symbols.`;

  const systemPrompt = "You are a professional author writing high-quality book content. Write engaging, well-structured chapters with natural, flowing prose. Maintain consistent style and voice throughout. Use proper paragraph breaks and professional structure. Write content that feels like it belongs in a published book. Do not use asterisks, bullet points, or special formatting symbols.";
  
  return await callOpenRouter(API_CONFIGS.deepseekR1, prompt, systemPrompt);
}