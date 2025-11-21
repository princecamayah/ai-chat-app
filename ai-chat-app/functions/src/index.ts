import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";

setGlobalOptions({ region: "europe-west2" });

/**
 * A simple callable function to test our setup.
 * Note: In v2, we receive a single 'request' object.
 */
export const helloWorld = onCall((request) => {
  console.log("helloWorld function triggered");

  // Access data and auth from the request object
  console.log("Data:", request.data);
  console.log("Auth:", request.auth);

  // Send back a response
  return {
    message: "Hello from the secure v2 server!",
    dataReceived: request.data,
  };
});

