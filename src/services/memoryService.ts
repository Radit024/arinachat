import { v4 as uuidv4 } from 'uuid';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { createClient } from '@supabase/supabase-js';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { Document } from "langchain/document";
import { saveEntities, getEntities } from './entityService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define types
export interface MemoryContext {
  userMessage: string;
  recentMessages: {
    role: string;
    content: string;
  }[];
  relevantEntities: string[];
  userProfile: any;
}

export interface MemoryUser {
  id: string;
  email: string;
}

const defaultContext: MemoryContext = {
  userMessage: '',
  recentMessages: [],
  relevantEntities: [],
  userProfile: null,
};

// Initialize Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be provided as environment variables.');
}

// Function to load documents from a directory
export const loadDocuments = async (directory: string): Promise<Document[]> => {
  const txtLoader = new TextLoader(`${directory}/state_of_the_union.txt`);
  const pdfLoader = new PDFLoader(`${directory}/machinelearning-arxiv.pdf`);

  const txtDocuments = await txtLoader.load();
  const pdfDocuments = await pdfLoader.load();

  return [...txtDocuments, ...pdfDocuments];
};

// Function to create a vector store from documents
export const createVectorStore = async (docs: Document[]): Promise<MemoryVectorStore> => {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 0 });
  const splitDocs = await splitter.splitDocuments(docs);

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  return vectorStore;
};

// Function to perform a similarity search in the vector store
export const performSimilaritySearch = async (vectorStore: MemoryVectorStore, query: string, k: number = 2): Promise<Document[]> => {
  const results = await vectorStore.similaritySearch(query, k);
  return results;
};

// Function to initialize Supabase vector store
export const initializeSupabaseVectorStore = async (openAIApiKey: string): Promise<SupabaseVectorStore> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key must be provided as environment variables.');
  }

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const embeddings = new OpenAIEmbeddings({ openAIApiKey });

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  return vectorStore;
};

// Function to load data into Supabase vector store
export const loadDataIntoSupabase = async (directory: string, openAIApiKey: string) => {
  try {
    const docs = await loadDocuments(directory);
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 0 });
    const splitDocs = await splitter.splitDocuments(docs);

    const vectorStore = await initializeSupabaseVectorStore(openAIApiKey);
    await SupabaseVectorStore.fromDocuments(splitDocs, new OpenAIEmbeddings({ openAIApiKey }), {
      client: vectorStore.client,
      tableName: vectorStore.tableName,
      queryName: vectorStore.queryName,
    });

    console.log('Data loaded into Supabase successfully.');
  } catch (error) {
    console.error('Error loading data into Supabase:', error);
    throw error;
  }
};

// Function to perform similarity search in Supabase vector store
export const performSupabaseSimilaritySearch = async (
  vectorStore: SupabaseVectorStore,
  query: string,
  k: number = 2
): Promise<Document[]> => {
  try {
    const results = await vectorStore.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error('Error performing similarity search in Supabase:', error);
    throw error;
  }
};

// Function to initialize the language model
export const initializeLanguageModel = (openAIApiKey: string, temperature: number = 0.7) => {
  const model = new ChatOpenAI({
    openAIApiKey,
    temperature,
  });
  return model;
};

// Function to initialize memory with message history
export const initializeMemory = (modelName: string = 'Arina'): BufferMemory => {
  const memory = new BufferMemory({
    chatHistory: new ChatMessageHistory({
      messages: [
        new AIChatMessage(`You are ${modelName}, a helpful AI assistant.`),
      ]
    }),
    memoryKey: "chat_history",
    returnMessages: true,
  });
  return memory;
};

// Function to create a conversation chain
export const createConversationChain = (
  model: ChatOpenAI,
  memory: BufferMemory,
  prompt: any
): ConversationChain => {
  const chain = new ConversationChain({
    llm: model,
    memory: memory,
    prompt: prompt
  });
  return chain;
};

// Function to generate a unique user ID
export const generateUserId = (): string => {
  return uuidv4();
};

// Function to initialize a memory user with Supabase
export const initializeMemoryUser = async (): Promise<MemoryUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return {
        id: user.id,
        email: user.email || 'default@example.com',
      };
    } else {
      console.log('No user found in session.');
      return null;
    }
  } catch (error) {
    console.error("Error initializing memory user:", error);
    return null;
  }
};

// Function to save user message and assistant response to chat history
export const saveChatHistory = async (
  chatId: string,
  userId: string,
  message: string,
  response: string
): Promise<void> => {
  try {
    const { error: messageError } = await supabase
      .from('messages')
      .insert([
        { chat_id: chatId, user_id: userId, content: message, sender: 'user' },
        { chat_id: chatId, user_id: userId, content: response, sender: 'assistant' },
      ]);

    if (messageError) {
      console.error("Error saving messages:", messageError);
    }
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};

// Function to create a new chat
export const createChat = async (userId: string, title: string): Promise<{ id: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([{ user_id: userId, title: title }])
      .select('id')
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
};

// Function to load chat history from Supabase
export const loadChatHistory = async (chatId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
};

// Function to prepare chat history for the language model
export const prepareChatHistoryForModel = (chatHistory: any[]): (AIChatMessage | HumanChatMessage)[] => {
  return chatHistory.map(message => {
    if (message.sender === 'user') {
      return new HumanChatMessage(message.content);
    } else {
      return new AIChatMessage(message.content);
    }
  });
};

// Function to update chat title
export const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chats')
      .update({ title: title })
      .eq('id', chatId);

    if (error) {
      console.error("Error updating chat title:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating chat title:", error);
    return false;
  }
};

// Function to create initial memory context
export const createInitialMemoryContext = (messageText: string): MemoryContext => {
  return { 
    userMessage: messageText,
    recentMessages: [],
    relevantEntities: [],
    userProfile: null
  };
};
