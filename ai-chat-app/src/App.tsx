import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './lib/firebase';

function App() {
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const callBackend = async () => {
    setLoading(true);
    setResponseMessage("Calling backend...");
    
    try {
      // 1. Create a reference to the 'helloWorld' function
      const helloWorld = httpsCallable(functions, 'helloWorld');
      
      // 2. Call the function securely
      const result = await helloWorld({ message: "Hello from React!" });
      
      // 3. Display the result
      // (We know our function returns { message: string })
      const data = result.data as { message: string };
      setResponseMessage(data.message);
      
    } catch (error) {
      console.error(error);
      setResponseMessage("Error calling backend. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">CS310 Project</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="mb-4 text-gray-700">
          Test the connection between React and Firebase Cloud Functions.
        </p>
        
        <button
          onClick={callBackend}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
        >
          {loading ? "Waiting..." : "Call Secure Backend"}
        </button>

        {responseMessage && (
          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="font-mono text-sm text-gray-800">{responseMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;