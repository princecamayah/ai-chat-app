import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { ChatMessage } from '@/stores/chatStore';

// path 1: brand new chat - creates a new conversation and saves the first message
export const createNewConversation = async (userId: string, firstMessage: ChatMessage) => {
    try {
        // get the location of the conversations collection
        // db root -> conversations collection
        const conversationsRef = collection(db, 'conversations');

        // create the new conversation document
        const newConversationDoc = await addDoc(conversationsRef, {
            userId: userId,
            title: firstMessage.content.substring(0, 40) + "...",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // get the location of the subcollection of the new document
        // db root -> converstions collection -> new document -> subcollection of the new document
        const messagesRef = collection(db, 'conversations', newConversationDoc.id, 'messages');

        // save the new message into the subcollection
        await addDoc(messagesRef, {
            role: firstMessage.role,
            content: firstMessage.content,
            type: firstMessage.type,
            createdAt: serverTimestamp()
        });

        // return the id of the newly created conversation so that the Zustand store can update its active state
        return newConversationDoc.id;

    } catch (error) {
        console.error("Error creating new conversation:", error);
        throw error;
    }
};

// path 2: adds a message to an existing conversation and updates timestamp of the conversation
export const addMessageToConversation = async (conversationId: string, newMessage: ChatMessage ) => {
    try {
        // get the location of the conversation document
        const conversationRef = doc(db, 'conversations', conversationId);

        // update timestamp
        await updateDoc(conversationRef, {
            updatedAt: serverTimestamp()
        });

        // get the location of the messages subcollection in the conversation document
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');

        // add the new message
        await addDoc(messagesRef, {
            role: newMessage.role,
            content: newMessage.content,
            type: newMessage.type,
            createdAt: serverTimestamp()
        });

    } catch (error) {
        console.error("Error adding message to conversation:", error);
        throw error;
    }
}