import { createSignal, onMount, Show } from 'solid-js';
import { supabase, createEvent } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [recording, setRecording] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [responseAudioUrl, setResponseAudioUrl] = createSignal('');

  const checkUserSignedIn = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(() => {
    checkUserSignedIn();
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  let recognition;

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('This browser does not support speech recognition. Please use Chrome.');
      return;
    }
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setRecording(true);

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setRecording(false);
      await handleChatGPTRequest(speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognition.start();
  };

  const handleChatGPTRequest = async (text) => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: text,
        response_type: 'text',
      });
      await handleTextToSpeech(result);
    } catch (error) {
      console.error('Error handling chatgpt_request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async (text) => {
    setLoading(true);
    try {
      const result = await createEvent('text_to_speech', {
        text: text,
      });
      setResponseAudioUrl(result);
    } catch (error) {
      console.error('Error handling text_to_speech:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4 text-gray-800">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-purple-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                showLinks={false}
                redirectTo={window.location.origin}
              />
            </div>
          </div>
        }
      >
        <div class="max-w-2xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-purple-600">Assistant App for the Blind</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md h-full">
            <p class="text-lg mb-4">Press the button below and speak your query. The assistant will respond with an audio reply.</p>

            <button
              class={`w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${recording() || loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={startRecording}
              disabled={recording() || loading()}
            >
              {recording() ? 'Recording...' : 'Start Recording'}
            </button>

            <Show when={loading()}>
              <p class="mt-4 text-center text-gray-600">Processing...</p>
            </Show>

            <Show when={responseAudioUrl()}>
              <div class="mt-6">
                <h2 class="text-xl font-bold mb-2">Assistant's Response:</h2>
                <audio controls src={responseAudioUrl()} class="w-full" />
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;