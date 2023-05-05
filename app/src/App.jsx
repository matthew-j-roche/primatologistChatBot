import { useState } from "react";
import "./App.css";
import "/Users/mattroche/Development/code/cb/app/node_modules/@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";

const API_KEY = "####";

const systemMessage = {
  role: "system",
  content:
     "You're name is Dr. Goodell. You are a highly educated and highly experienced primatologist. You are helping me prepare for a presentation by pretending that I am a bonobo when you respond to me. Explain all concepts like I am a young child",
}

  // content ---- this prompt provides ChatGPT with the direction for its "character". The more specific the propt the more defined the character. Small tweaks to the prompt can make big differences in responses. The character's background, style of speech, the manner in which addresses your questions can all be factored in. 
  // In this example I originally described myself as a bonobo that had recently acquired the power of speech and asked the chatbot to address me accordingly. This was too much for it too handle and it reverted to plain old ChapGPT. After a few different approaches we were able to see eye to eye with the concept that I'm pretending to be a bonobo in preparation for a presentation I have to give.

//const userAvatar = "/Users/mattroche/Development/code/cb/app/src/assets/bonoboAvatar.png";
//const botAvatar = "/Users/mattroche/Development/code/cb/app/src/assets/primatologistAvatar.png";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello my Bonobo friend. Do you have any questions for me?",
      sentTime: "just now",
      sender: "ChatGPT",
//     avatarSrc: botAvatar,
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      direction: 'outgoing',
      sender: "user",
//      avatarSrc: userAvatar,
    };

      const newMessages = [...messages, newMessage];

      setMessages(newMessages);

      //Initial system message to determine ChatGPT functionality

      setIsTyping(true);
      await processMessageToChatGPT(newMessages);
    };
  
    async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message }
    });

      // role: "user" ---- message from user
      // role: "assistant" ---- response from ChatGPT
      // "system" ---- defines ChatGPT "character"

      const apiRequestBody = {
         "temperature": 1,
         "max_tokens": 100,
         "model": "gpt-3.5-turbo",
         "messages": [systemMessage,...apiMessages],
      }

      // "temperature" ---- defines the level of creativity/randomness of the responses, on a scale of 0-1 with 0 generating the most conservative and coherent responses and 1 generating the most creative but potentially least coherent responses. 
      // "max_tokens" ---- defines the maximum length of the response. 100 tokens is roughly one short paragraph 

      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        data.json().then(responseData => {
          console.log(responseData);
          if (responseData.choices && responseData.choices[0]) {
            setMessages([...chatMessages, {
              message: responseData.choices[0].message.content,
              sender: "ChatGPT"
            }]);
          } else {
            console.log("Error: responseData.choices is undefined or empty");
          }
          setIsTyping(false);
        });
      });
    }

   return (
      <div className="App">
         <div style={{ position: "relative", height: "800px", width: "700px" }}>
            <MainContainer>
               <ChatContainer>
                  <MessageList
                    scrollBehavior="smooth"
                     typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}>
                     {messages.map((message, i) => {
                        console.log(message)
                        return <Message key={i} model={message} />
                     })}
                  </MessageList>
                  <MessageInput placeholder="Type here" onSend={handleSend} />
               </ChatContainer>
            </MainContainer>
         </div>
      </div>
   )
}

export default App;