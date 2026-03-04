import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, writeBatch, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { ChatMessage, ConversationMeta } from '@/stores/chatStore';

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
            phase: 'discovery',
            activePlan: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // get the location of the subcollection of the new document
        // db root -> converstions collection -> new document -> subcollection of the new document
        const messagesRef = collection(db, 'conversations', newConversationDoc.id, 'messages');

        // save the new message into the subcollection
        if (firstMessage.role !== 'transient') {
            await addDoc(messagesRef, {
                role: firstMessage.role,
                content: firstMessage.content,
                type: firstMessage.type,
                createdAt: serverTimestamp()
            });
        }
        
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

// deletes all messages in a conversation's history
export const clearConversationHistory = async (conversationId: string) => {
    try {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');

        // fetch all documents inside the messages subcollection
        const snapshot = await getDocs(messagesRef);

        // initialise a new batch operation
        const batch = writeBatch(db);

        snapshot.forEach((document) => {
            batch.delete(document.ref);
        });

        await batch.commit();

        console.log("Database history cleared successfully.");
    } catch (error) {
        console.error("Error clearing conversation history:", error);
        throw error;
    }
}

// utility function to update the phase and active plan state of a conversation
export const updateConversationState = async (conversationId: string, phase: string, activePlan: string | null) => {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
        phase: phase,
        activePlan: activePlan,
        updatedAt: serverTimestamp()
    });
}

export const subscribeToUserConversations = (
    userId: string,
    onUpdate: (conversations: ConversationMeta[]) => void // this is our setConversations action from Zustand
) => {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
        conversationsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
    );

    // onSnapshot() opens a real-time web socket connection to the database
    // it returns a function that severs the connection, so we store it as unsubscribe
    const unsubscribe = onSnapshot(
        q,
        (snapshot) => { 
            const fetchedConversations: ConversationMeta[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || "New Conversation",
                    updatedAt: data.updatedAt ? data.updatedAt.toMillis() : Date.now() // fallback
                };
            });

            // save the fetched conversations array to our Zustand store
            onUpdate(fetchedConversations);
        },
        (error) => {
            console.error("Firestore Listener Error:", error);
        }
    );

    // return the teardown function so that React can clean it up
    return unsubscribe;
}