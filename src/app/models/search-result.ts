export interface SearchResult {
    // response: string | Record<string, any> | Array<Record<string, any>>;
    response: string;
    context_data: string | Array<Record<string, any>> | Record<string, Array<Record<string, any>>>;
    context_text: string | string[] | Record<string, string>;
    completion_time: number;
    llm_calls: number;
    prompt_tokens: number;
    reduce_context_data?: string | Array<Record<string, any>> | Record<string, Array<Record<string, any>>>;
    reduce_context_text?: string | string[] | Record<string, string>;
    map_responses?: Array<SearchResult>;
  }
  