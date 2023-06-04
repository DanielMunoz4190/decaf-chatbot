import { useEffect, useState } from 'react'
import { Button } from './Button'
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from './ChatLine'
import { useCookies, Cookies } from 'react-cookie'
import { signAndSend } from '../utils/SolanaFunctions'

const COOKIE_NAME = 'nextjs-example-ai-chat-gpt3'

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: 'assistant',
    content: '¡Hola! Soy Decaf, el asistente virtual de Decaf Wallet. ¿En qué puedo ayudarte?',
  },
]

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="mt-6 flex clear-both">
    <input
      type="text"
      aria-label="chat input"
      required
      className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendMessage(input)
          setInput('')
        }
      }}
      onChange={(e) => {
        setInput(e.target.value)
      }}
      placeholder='Escribe aquí...'
    />
    <Button
      type="submit"
      className="ml-4 flex-none"
      onClick={() => {
        sendMessage(input)
        setInput('')
      }}
    >
      Enviar
    </Button>
  </div>
)

export function Chat({walletPublicKey}: { walletPublicKey: string }) {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, randomId)
    }
  }, [cookie, setCookie])

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true);
    const newMessages = [
      ...messages,
      { role: "user", content: message } as ChatGPTMessage,
    ];
    setMessages(newMessages);
    const last10messages = newMessages.slice(-10); // remember last 10 messages
    console.log("Sending to edge function: ", last10messages);
  
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: last10messages,
        user: cookie[COOKIE_NAME],
      }),
    });
  
    console.log("Edge function returned.");
    console.log(response);
  
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  
    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }
  
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
  
    let lastMessage = "";
  
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
  
      lastMessage = lastMessage + chunkValue;
    }
  
    setLoading(false);
  
    const jsonRegex = /{(?:[^{}]|{[^{}]*})*}/;
    const isResponseObject = lastMessage.match(jsonRegex);
    console.log(lastMessage);
    console.log(isResponseObject);
    if (isResponseObject) {
      let msjRgx = "Accion procesada";
      const cleanedJSON = isResponseObject[0].replace(/\s/g, "");
      console.log(msjRgx);
      console.log(cleanedJSON);
      const parsedJSON = JSON.parse(cleanedJSON);
      console.log(parsedJSON);
  
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Aprueba la transacción con tu billetera para confirmar la transferencia" } as ChatGPTMessage,
      ]);

      const cookies = new Cookies();
      const fromWallet = cookies.get('walletAddress') as string;
      const toWallet = parsedJSON.addressDestino as string;
      const amount = parsedJSON.amount as number;

      const data = {
        fromWallet: fromWallet,
        toAddress: toWallet,
        amount: amount
      }

      await signAndSend(data);

    } else {
      setMessages([
        ...newMessages,
        { role: "assistant", content: lastMessage } as ChatGPTMessage,
      ]);
    }
  };

  return (
    <div className="rounded-2xl border-zinc-100  lg:border lg:p-6 w-full h-full flex flex-col justify-end">
      <div className='h-full overflow-y-auto'>
      {messages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} image="decaf_logo.png"/>
      ))}
      </div>

      {loading && <LoadingChatLine />}

      {messages.length < 2 && (
        <span className="mx-auto flex flex-grow text-gray-600 clear-both items-center justify-center">
          Escribe un mensaje para comenzar
        </span>
      )}
      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </div>
  )
}
