export interface ParsedStory {
  narration:     string;
  chapterTitle:  string;
  choices:       string[];
  isEnding:      boolean;
  isFailure:     boolean;
  isMoralLesson: boolean;
}

export function parseStoryResponse(raw: string): ParsedStory {
  function block(tag: string): string | null {
    const re = new RegExp(`\\[${tag}[^\\]]*\\]\\s*([\\s\\S]*?)(?=\\s*\\[|$)`, 'i');
    const m = raw.match(re);
    return m ? m[1].trim() : null;
  }

  const narration    = block('STORY SEGMENT') ?? 'Something magical happens…';
  const chapterTitle = block('CHAPTER TITLE') ?? '';
  const choiceA      = block('CHOICE A');
  const choiceB      = block('CHOICE B');
  const choiceC      = block('CHOICE C');
  const endingMatch  = raw.match(/\[ENDING:\s*(\w+)\]/i);
  const endingType   = endingMatch ? endingMatch[1].toLowerCase() : null;
  const hasChoices   = !!(choiceA && choiceB);
  const isEnding     = !hasChoices || !!endingType;
  const isFailure    = endingType === 'failure';
  const isMoralLesson = endingType === 'lesson';
  const choices      = hasChoices
    ? (choiceC ? [choiceA!, choiceB!, choiceC] : [choiceA!, choiceB!])
    : [];

  return { narration, chapterTitle, choices, isEnding, isFailure, isMoralLesson };
}

export function stripSSML(text: string): string {
  return text
    .replace(/<speak>/gi, '')
    .replace(/<\/speak>/gi, '')
    .replace(/<break[^>]*\/>/gi, ' ')
    .replace(/<emphasis[^>]*>(.*?)<\/emphasis>/gi, '$1')
    .replace(/<prosody[^>]*>(.*?)<\/prosody>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
