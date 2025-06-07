
const API_CONFIGS = {
  deepseek: {
    key: "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",
    model: "deepseek/deepseek-reasoner"
  },
  qwen: {
    key: "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",
    model: "qwen/qwen-2.5-72b-instruct"
  },
  deepseekR1: {
    key: "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",
    model: "deepseek/deepseek-r1"
  },
  mistral: {
    key: "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",
    model: "mistralai/mistral-small"
  }
};

async function callOpenRouter(apiConfig: any, prompt: string, systemPrompt?: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiConfig.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: apiConfig.model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateBookIdea(bookName?: string, description?: string) {
  const prompt = bookName || description 
    ? `Generate a comprehensive book idea based on the following:
       ${bookName ? `Book Name: ${bookName}` : ''}
       ${description ? `Description: ${description}` : ''}
       
       Provide a compelling book title, detailed outline with chapter breakdown, main themes, target audience, and key plot points. Make it engaging and marketable.`
    : `Generate a completely original and creative book idea. Include:
       - A compelling book title
       - Genre and target audience
       - Main themes and concepts
       - Detailed chapter outline (8-12 chapters)
       - Key characters or concepts
       - Unique selling points
       
       Make it fresh, engaging, and marketable.`;

  const systemPrompt = "You are a bestselling author and publishing expert. Create detailed, engaging book concepts that would appeal to readers and publishers.";
  
  return await callOpenRouter(API_CONFIGS.deepseek, prompt, systemPrompt);
}

export async function generateBookOutline(title: string, description: string, chapters: number) {
  const prompt = `Create a detailed book outline for:
    Title: ${title}
    Description: ${description}
    Number of Chapters: ${chapters}
    
    Provide:
    1. A refined book summary
    2. Chapter-by-chapter breakdown with:
       - Chapter number and title
       - Brief chapter summary
       - Key points to cover
       - How it connects to the overall narrative
    
    Make each chapter substantial and ensure good flow between chapters.`;

  const systemPrompt = "You are a professional book editor and author. Create well-structured, engaging book outlines that follow proper storytelling principles.";
  
  return await callOpenRouter(API_CONFIGS.qwen, prompt, systemPrompt);
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
    Target Word Count: ${targetWords} words
    ${contextInfo}
    
    Requirements:
    - Write engaging, high-quality content
    - Maintain consistency with the book's theme and style
    - Include proper chapter structure with good pacing
    - Ensure it flows well with previous chapters
    - Write in a professional, publishable style
    - Aim for approximately ${targetWords} words
    
    Focus on storytelling, character development (if applicable), and advancing the main themes.`;

  const systemPrompt = "You are a professional author writing high-quality book content. Write engaging, well-structured chapters that readers will love. Maintain consistent style and voice throughout.";
  
  return await callOpenRouter(API_CONFIGS.deepseekR1, prompt, systemPrompt);
}
