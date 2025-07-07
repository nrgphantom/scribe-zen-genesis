
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

export const generateBookIdea = async (
  topic: string, 
  targetAudience: string, 
  bookType: "fiction" | "nonfiction",
  numChapters: number,
  customDescription?: string
): Promise<string> => {
  // If user provided a custom description, use it directly
  if (customDescription && customDescription.trim()) {
    return customDescription.trim();
  }

  // Auto-generate topic and audience if not provided
  const finalTopic = topic.trim() || (bookType === "fiction" ? "adventure and discovery" : "personal development");
  const finalAudience = targetAudience.trim() || "general readers";

  const prompt = bookType === "fiction" 
    ? `Generate a compelling fiction book idea for "${finalTopic}" targeting ${finalAudience}. Include:

TITLE: [Provide a captivating title]

PREMISE: [2-3 sentences describing the main story]

MAIN CHARACTERS: [Brief description of key characters]

SETTING: [Where and when the story takes place]

CONFLICT: [The central conflict or challenge]

THEMES: [Major themes explored]

TARGET AUDIENCE: ${finalAudience}

STRUCTURE: ${numChapters} chapters with engaging plot progression

Make it creative, engaging, and marketable for the target audience.`
    
    : `Generate a comprehensive non-fiction book idea for "${finalTopic}" targeting ${finalAudience}. Include:

TITLE: [Provide a clear, compelling title]

PURPOSE: [What problem does this book solve or what knowledge does it provide?]

TARGET AUDIENCE: ${finalAudience}

KEY CONCEPTS: [Main topics and concepts covered]

UNIQUE ANGLE: [What makes this book different from others on the topic?]

PRACTICAL VALUE: [How will readers benefit from this book?]

RESEARCH APPROACH: [How will you ensure factual accuracy and credibility?]

STRUCTURE: ${numChapters} chapters with logical progression

Focus on real-world applications, factual accuracy, and genuine value for readers.`;

  return await callGeminiAPI(prompt);
};

export const generateBookOutline = async (
  title: string,
  description: string,
  numChapters: number,
  bookType: "fiction" | "nonfiction"
): Promise<string> => {
  const prompt = bookType === "fiction"
    ? `Create a detailed ${numChapters}-chapter outline for the fiction book "${title}".

Book Description: ${description}

Provide:
- Brief book summary
- Chapter-by-chapter breakdown with titles and 2-3 sentence descriptions
- Character development arc
- Plot progression and pacing
- Key themes and conflicts

Format as:
Chapter 1: [Title]
- [Description]

Chapter 2: [Title]
- [Description]

And so on...`

    : `Create a detailed ${numChapters}-chapter outline for the non-fiction book "${title}".

Book Description: ${description}

Provide:
- Book overview and objectives
- Chapter-by-chapter breakdown with titles and key topics
- Learning objectives for each chapter
- Logical flow of information
- Practical applications and takeaways

Ensure factual accuracy and educational value. Format as:
Chapter 1: [Title]
- [Key topics and objectives]

Chapter 2: [Title]
- [Key topics and objectives]

And so on...`;

  const systemPrompt = bookType === "fiction" 
    ? 'You are an expert fiction editor and story structure specialist. Create compelling, well-paced chapter outlines that ensure narrative flow and character development.'
    : 'You are an expert non-fiction editor and educational content developer. Create logical, informative chapter outlines that build knowledge progressively and provide practical value.';

  return await callGeminiAPI(prompt, systemPrompt);
};

export const generateChapterContent = async (
  bookTitle: string,
  chapterTitle: string,
  chapterNumber: number,
  bookDescription: string,
  targetWords: number,
  previousChapters: string[],
  bookType: "fiction" | "nonfiction"
): Promise<string> => {
  const previousContext = previousChapters.length > 0 
    ? `Previous chapters covered: ${previousChapters.join(', ')}`
    : 'This is the first chapter.';

  const prompt = bookType === "fiction"
    ? `Write Chapter ${chapterNumber} titled "${chapterTitle}" for the fiction book "${bookTitle}".

Book Description: ${bookDescription}
${previousContext}
Target Length: Approximately ${targetWords} words

Requirements:
- Engaging narrative voice and style
- Well-developed characters and dialogue
- Vivid descriptions and settings
- Clear plot progression
- Maintain consistency with previous chapters
- Create hooks to keep readers engaged
- Proper pacing and tension

Write a complete, polished chapter that advances the story while maintaining high literary quality.`

    : `Write Chapter ${chapterNumber} titled "${chapterTitle}" for the non-fiction book "${bookTitle}".

Book Description: ${bookDescription}
${previousContext}
Target Length: Approximately ${targetWords} words

Requirements:
- Clear, authoritative writing style
- Well-researched, factual content
- Practical examples and case studies
- Actionable insights and takeaways
- Logical structure with smooth transitions
- Credible sources and references where appropriate
- Engaging yet professional tone

Write a complete, informative chapter that provides genuine value to readers while maintaining academic rigor.`;

  const systemPrompt = bookType === "fiction"
    ? 'You are a professional fiction writer with expertise in crafting compelling narratives. Write engaging, high-quality chapters that captivate readers and advance the story effectively.'
    : 'You are a professional non-fiction author and subject matter expert. Write informative, well-researched chapters that educate readers and provide practical value. Ensure factual accuracy and credibility.';

  return await callGeminiAPI(prompt, systemPrompt);
};
