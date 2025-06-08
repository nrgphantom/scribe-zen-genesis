async function callMistralAPI(prompt: string, systemPrompt?: string) {
  console.log("Making API call to Mistral via OpenRouter");
  
  const apiKey = "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";
  
  if (!apiKey) {
    throw new Error("Mistral API key not found");
  }
  
  try {
    console.log("Sending request with prompt:", prompt.substring(0, 100) + "...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "ZedScribe"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-large",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 8000,
        stream: false
      }),
    });

    console.log("API Response status:", response.status);
    console.log("API Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      
      // Try alternative model if the first one fails
      console.log("Trying alternative model: mistralai/mistral-medium");
      
      const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "ZedScribe"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-medium",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 6000,
          stream: false
        }),
      });
      
      if (!fallbackResponse.ok) {
        const fallbackErrorText = await fallbackResponse.text();
        console.error("Fallback API Error:", fallbackErrorText);
        throw new Error(`Both API calls failed. Primary: ${response.status} - ${errorText}. Fallback: ${fallbackResponse.status} - ${fallbackErrorText}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log("Fallback API Response received:", fallbackData);
      
      if (!fallbackData.choices || !fallbackData.choices[0] || !fallbackData.choices[0].message) {
        console.error("Invalid fallback response structure:", fallbackData);
        throw new Error("Invalid fallback API response structure");
      }
      
      let content = fallbackData.choices[0].message.content;
      return cleanText(content);
    }

    const data = await response.json();
    console.log("API Response received:", data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid API response structure");
    }
    
    let content = data.choices[0].message.content;
    return cleanText(content);
    
  } catch (error) {
    console.error("Mistral API call error:", error);
    
    // Final fallback to a simple, reliable model
    try {
      console.log("Attempting final fallback with basic model");
      
      const finalResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "ZedScribe"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        }),
      });
      
      if (finalResponse.ok) {
        const finalData = await finalResponse.json();
        if (finalData.choices && finalData.choices[0] && finalData.choices[0].message) {
          return cleanText(finalData.choices[0].message.content);
        }
      }
    } catch (finalError) {
      console.error("Final fallback failed:", finalError);
    }
    
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

export async function generateBookIdea(bookName?: string, description?: string) {
  console.log("Generating book idea with Mistral API");
  
  const prompt = bookName || description 
    ? `Create a comprehensive book concept based on the following information:
       ${bookName ? `Book Title: ${bookName}` : ''}
       ${description ? `Book Description: ${description}` : ''}
       
       Please provide a complete book idea that includes:
       
       1. A compelling title (if not already provided)
       2. Genre and target audience
       3. Main premise and central themes
       4. Detailed chapter outline with 8-12 chapters
       5. Key plot points or main concepts
       6. What makes this book unique and marketable
       
       Write this as a professional book proposal in clear, engaging prose. Use proper paragraph structure and avoid any special formatting symbols.`
    : `Create an original and compelling book concept that includes:
       
       1. A unique and marketable title
       2. Clear genre and target audience identification
       3. Engaging premise and main themes
       4. Detailed chapter outline with 8-12 chapters
       5. Key characters or main concepts
       6. What makes this book special and different
       
       Write this as a professional book proposal in clear, engaging prose. Use proper paragraph structure and avoid any special formatting symbols.`;

  const systemPrompt = "You are an experienced bestselling author and publishing expert. Your task is to create detailed, engaging book concepts that would appeal to both readers and publishers. Write in clear, professional prose using proper paragraph structure. Focus on creating compelling, marketable book ideas that could realistically be published. Do not use asterisks, bullet points, or any special formatting symbols in your response.";
  
  return await callMistralAPI(prompt, systemPrompt);
}

export async function generateBookOutline(title: string, description: string, chapters: number) {
  console.log("Generating book outline with Mistral API");
  
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
  
  return await callMistralAPI(prompt, systemPrompt);
}

export async function generateChapterContent(
  bookTitle: string, 
  chapterTitle: string, 
  chapterNumber: number, 
  bookDescription: string, 
  targetWords: number,
  previousChapters?: string[]
) {
  console.log("Generating chapter content with Mistral API");
  
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
  
  return await callMistralAPI(prompt, systemPrompt);
}