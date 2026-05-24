import { create } from 'zustand';

export type InputType = 'code' | 'swagger' | 'signature' | 'readme' | 'architecture';
export type DocType = 
  | 'api-reference' 
  | 'function-docs' 
  | 'setup-guide' 
  | 'architecture' 
  | 'integration' 
  | 'troubleshooting' 
  | 'schema';
export type ToneType = 'technical' | 'beginner' | 'executive';

interface DocState {
  input: string;
  inputType: InputType;
  documentationType: DocType;
  tone: ToneType;
  language: string;
  documentation: string;
  isLoading: boolean;
  error: string | null;
  
  setInput: (input: string) => void;
  setInputType: (type: InputType) => void;
  setDocumentationType: (type: DocType) => void;
  setTone: (tone: ToneType) => void;
  setLanguage: (lang: string) => void;
  setDocumentation: (doc: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useDocStore = create<DocState>((set) => ({
  input: '',
  inputType: 'code',
  documentationType: 'api-reference',
  tone: 'technical',
  language: 'auto',
  documentation: '',
  isLoading: false,
  error: null,
  
  setInput: (input) => set({ input }),
  setInputType: (inputType) => set({ inputType }),
  setDocumentationType: (documentationType) => set({ documentationType }),
  setTone: (tone) => set({ tone }),
  setLanguage: (language) => set({ language }),
  setDocumentation: (documentation) => set({ documentation }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clear: () => set({
    input: '',
    documentation: '',
    error: null,
    isLoading: false,
  }),
}));
