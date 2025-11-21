import { https } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";

// initialise the Firebase Admin SDK.
initializeApp();

export const helloWorld = https.onCall((data, context) => {
    console.log("helloWorld function triggered");

    console.log("Data:", data);
    console.log("Auth:", context.auth);

    return {
        message: "Hello from secure server! Your request was received.",
        dataReceived: data,
    };
});

