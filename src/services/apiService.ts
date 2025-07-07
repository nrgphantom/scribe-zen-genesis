
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

export async function generateBookIdea(bookName?: string, description?: string, numChapters?: number, bookType?: "fiction" | "nonfiction") {
  console.log("Generating book idea with Google Gemini API");
  
  const chapterInfo = numChapters ? `\nNumber of Chapters: ${numChapters}` : '';
  const typeSpecific = bookType === "nonfiction" ? "non-fiction" : "fiction";
  
  const prompt = bookName || description 
    ? `Create a comprehensive ${typeSpecific} book concept based on the following information:
       ${bookName ? `Book Title: ${bookName}` : ''}
       ${description ? `Book Description: ${description}` : ''}${chapterInfo}
       Book Type: ${typeSpecific.toUpperCase()}
       
       Please provide a complete ${typeSpecific} book idea that includes:
       
       Title: [Compelling ${typeSpecific} title if not already provided]
       Genre: [Specific ${typeSpecific} genre and target audience]
       Description: [Main premise and central themes in 2-3 paragraphs]
       ${numChapters ? `Chapter Outline: [Brief outline for ${numChapters} chapters]` : 'Chapter Outline: [Brief outline with 8-12 chapters]'}
       Unique Elements: [What makes this ${typeSpecific} book special and marketable]
       
       ${bookType === "nonfiction" ? 
         "IMPORTANT: For non-fiction, ensure all content is factual, research-based, and includes real data, statistics, case studies, and credible information. Focus on practical value and educational content." :
         "IMPORTANT: For fiction, create compelling characters, engaging plot elements, and immersive world-building. Focus on narrative structure and emotional engagement."
       }
       
       Write this as a clear, engaging ${typeSpecific} book concept. Use proper paragraph structure and avoid any special formatting symbols.`
    : `Create an original and compelling ${typeSpecific} book concept that includes:
       ${chapterInfo}
       Book Type: ${typeSpecific.toUpperCase()}
       
       Title: [Unique and marketable ${typeSpecific} title]
       Genre: [Clear ${typeSpecific} genre and target audience identification]
       Description: [Engaging premise and main themes in 2-3 paragraphs]
       ${numChapters ? `Chapter Outline: [Brief outline for ${numChapters} chapters]` : 'Chapter Outline: [Brief outline with 8-12 chapters]'}
       Unique Elements: [What makes this ${typeSpecific} book special and different]
       
       ${bookType === "nonfiction" ? 
         "IMPORTANT: For non-fiction, ensure all content is factual, research-based, and includes real data, statistics, case studies, and credible information. Focus on practical value, educational content, and real-world applications." :
         "IMPORTANT: For fiction, create compelling characters, engaging plot elements, immersive world-building, and strong narrative structure. Focus on emotional engagement and storytelling."
       }
       
       Write this as a clear, engaging ${typeSpecific} book concept. Use proper paragraph structure and avoid any special formatting symbols.`;

  const systemPrompt = bookType === "nonfiction" ?
    "You are an experienced non-fiction author, researcher, and publishing expert specializing in educational and informational content. Create detailed, factual, and research-based book concepts that provide real value to readers. Always include genuine facts, statistics, case studies, and credible information. Focus on practical applications, real-world examples, and educational value. Ensure all content is accurate and evidence-based. Write in clear, professional prose using proper paragraph structure. Do not use asterisks, bullet points, or any special formatting symbols in your response." :
    "You are an experienced fiction author and publishing expert specializing in compelling storytelling. Create detailed, engaging fictional book concepts with strong characters, immersive world-building, and captivating plots. Focus on narrative structure, character development, and emotional engagement. Write in clear, professional prose using proper paragraph structure. Do not use asterisks, bullet points, or any special formatting symbols in your response.";
  
  return await callGeminiAPI(prompt, systemPrompt);
}

export async function generateBookOutline(title: string, description: string, chapters: number, bookType?: "fiction" | "nonfiction") {
  console.log("Generating book outline with Google Gemini API");
  
  const typeSpecific = bookType === "nonfiction" ? "non-fiction" : "fiction";
  
  const prompt = `Create a detailed ${typeSpecific} book outline for the following book:
    
    Book Title: ${title}
    Book Description: ${description}
    Required Number of Chapters: ${chapters}
    Book Type: ${typeSpecific.toUpperCase()}
    
    Please provide a comprehensive ${typeSpecific} outline that includes:
    
    1. A brief book summary (2-3 paragraphs)
    2. Complete chapter breakdown with the following for each chapter:
       - Chapter number and descriptive title
       - Detailed chapter summary (3-4 sentences explaining what happens)
       - Key points and objectives for that chapter
    
    ${bookType === "nonfiction" ? 
      "IMPORTANT: For non-fiction, ensure each chapter includes factual content, research references, real examples, case studies, and practical applications. Focus on educational value and actionable insights." :
      "IMPORTANT: For fiction, ensure each chapter advances the plot, develops characters, and maintains narrative flow. Include key story beats, character arcs, and dramatic elements."
    }
    
    Format each chapter clearly as:
    Chapter 1: [Descriptive Title]
    [Detailed summary content]
    
    Write in clear, professional prose without any special formatting symbols. Make sure each chapter builds logically on the previous ones.`;

  const systemPrompt = bookType === "nonfiction" ?
    "You are a professional non-fiction book editor and author with extensive experience in creating educational and informational book outlines. Your task is to create well-structured, factual, and research-based outlines that follow proper educational principles and logical progression. Include real data, examples, and practical applications. Write in clear, professional prose without using asterisks, bullet points, or any special formatting symbols. Format chapters clearly with numbers and descriptive titles." :
    "You are a professional fiction book editor and author with extensive experience in creating compelling story outlines. Your task is to create well-structured, engaging fictional outlines that follow proper storytelling principles, character development arcs, and narrative progression. Write in clear, professional prose without using asterisks, bullet points, or any special formatting symbols. Format chapters clearly with numbers and descriptive titles.";
  
  return await callGeminiAPI(prompt, systemPrompt);
}

export async function generateChapterContent(
  bookTitle: string, 
  chapterTitle: string, 
  chapterNumber: number, 
  bookDescription: string, 
  targetWords: number,
  previousChapters?: string[],
  bookType?: "fiction" | "nonfiction"
) {
  console.log("Generating chapter content with Google Gemini API");
  
  const typeSpecific = bookType === "nonfiction" ? "non-fiction" : "fiction";
  const contextInfo = previousChapters && previousChapters.length > 0 
    ? `\n\nContext from previous chapters: ${previousChapters.join(". ")}`
    : "";

  const prompt = `Write Chapter ${chapterNumber} titled "${chapterTitle}" for the ${typeSpecific} book "${bookTitle}".
    
    Book Description: ${bookDescription}
    Book Type: ${typeSpecific.toUpperCase()}
    Target Word Count: Approximately ${targetWords} words (focus on quality and completeness over exact word count)
    ${contextInfo}
    
    ${bookType === "nonfiction" ? 
      `IMPORTANT NON-FICTION GUIDELINES:
      - Include factual information, real data, statistics, and research findings
      - Provide practical examples, case studies, and real-world applications
      - Reference credible sources and evidence-based content
      - Structure content with clear explanations and actionable insights
      - Use educational and informative writing style
      - Include concrete examples and practical advice
      - Ensure all information is accurate and well-researched
      - Write in long, detailed paragraphs (4-8 sentences each) with substantial educational content
      - Focus on providing genuine value and learning outcomes for readers` :
      
      `IMPORTANT FICTION GUIDELINES:
      - Write in long, detailed paragraphs (4-8 sentences each)
      - Use fewer paragraphs but make each one substantial and immersive
      - Focus on deep character development, rich descriptions, and meaningful dialogue
      - Create vivid scenes that draw readers in completely
      - Maintain excellent pacing with detailed narrative flow
      - Each paragraph should advance the story significantly
      - Use sophisticated, literary prose that feels professional and engaging
      - Include sensory details, emotional depth, and atmospheric descriptions
      - Avoid short, choppy paragraphs - aim for substantial, flowing narrative blocks`
    }
    
    Please write engaging, high-quality chapter content that:
    - Flows naturally with long, immersive paragraphs
    - Maintains a consistent, sophisticated writing style
    - Advances the main themes and narrative of the book significantly
    - Uses detailed descriptions and ${bookType === "nonfiction" ? "factual information" : "rich character development"}
    - Maintains consistency with any previous chapters
    - Uses a professional, publishable ${typeSpecific} style
    - Creates compelling ${bookType === "nonfiction" ? "educational content" : "scenes"} with depth and substance
    - Aims for approximately ${targetWords} words while prioritizing quality
    - ${bookType === "nonfiction" ? "Includes real data, examples, and practical applications" : "Includes natural, meaningful dialogue woven into longer narrative passages"}
    - Builds ${bookType === "nonfiction" ? "knowledge and understanding" : "tension and maintains reader engagement"} throughout
    
    Write complete, well-developed content with substantial paragraphs and ${bookType === "nonfiction" ? "educational progression" : "natural story progression"}. Use clear, professional ${typeSpecific} prose without any special formatting symbols. This should read like a chapter from a professionally published ${typeSpecific} book with ${bookType === "nonfiction" ? "rich, informative content" : "rich, detailed writing"}.`;

  const systemPrompt = bookType === "nonfiction" ?
    "You are a professional non-fiction author and expert researcher known for creating comprehensive, educational content. Your writing style features long, detailed paragraphs that provide substantial factual information, real data, case studies, and practical applications. You excel at creating informative content with sophisticated prose, credible research, and actionable insights. Write content that feels like it belongs in a published educational work, with fewer but more substantial paragraphs that each provide significant learning value. Focus on creating an informative reading experience with detailed, factual content. Include real statistics, examples, and evidence-based information. Do not use asterisks, bullet points, or any special formatting symbols in your writing." :
    "You are a professional novelist and bestselling author known for rich, immersive storytelling. Your writing style features long, detailed paragraphs that draw readers deep into the story world. You excel at creating substantial narrative blocks with sophisticated prose, vivid descriptions, and compelling character development. Write content that feels like it belongs in a published literary work, with fewer but more substantial paragraphs that each advance the story significantly. Focus on creating an immersive reading experience with detailed, flowing narrative. Do not use asterisks, bullet points, or any special formatting symbols in your writing.";
  
  return await callGeminiAPI(prompt, systemPrompt);
}
