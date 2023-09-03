import { useState, useRef, useEffect } from "react"
import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import "./App.css"

function ChatMessage(props) {
  if (props.message.role === "assistant") {
    return (
      <div className="col-start-1 col-end-8 p-3 rounded-lg">
        <div className="flex flex-row items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 flex-shrink-0">
            AI
          </div>
          <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl text-left">
            <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
              {props.message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  } else if (props.message.role === "user") {
    return (
      <div className="col-start-6 col-end-13 p-3 rounded-lg">
        <div className="flex items-center justify-start flex-row-reverse">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sky-200 flex-shrink-0">
            U
          </div>
          <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl text-left">
            <div className="prose">{props.message.content}</div>
          </div>
        </div>
      </div>
    )
  }
}

function App() {
  const [input, setInput] = useState("")
  const [botState, setBotState] = useState({})
  const [history, setHistory] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [history])

  async function chatRequest(history, botState) {
    try {
      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: history, state: botState })
      })
      const content = await response.json()
      console.log(content)
      setHistory([...history, content.botResponse])
      setBotState(content.newState)
    } catch (error) {
      console.error("Failed to send chat history:", error)
    }
  }

  function chatInputHandler() {
    if (!input) {
      return
    }
    const newMessage = {
      content: input,
      role: "user"
    }
    setHistory([...history, newMessage])
    setInput("")
    chatRequest([...history, newMessage], botState)
  }

  return (
    <div
      className={`flex h-screen antialiased text-gray-800 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      <div className="flex flex-row h-full w-full overflow-x-hidden max-w-screen-md mx-auto">
        <div className="flex flex-col flex-auto h-full p-6 ">
          <div
            className={`flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full p-4 ${
              darkMode ? "bg-gray-900" : "bg-lime-100"
            }`}
          >
            <div className="flex flex-col h-full overflow-x-auto mb-4">
              <div className="grid grid-cols-12 gap-y-2">
                {history.map((message, idx) => (
                  <ChatMessage message={message} key={idx} />
                ))}
                <div ref={chatEndRef}></div>
              </div>
            </div>
            <div
              className={`flex flex-row items-center h-16 rounded-xl w-full px-4 ${
                darkMode ? "bg-gray-950" : "bg-white"
              }`}
            >
              <div
                onClick={() => {
                  setDarkMode(mode => !mode)
                }}
                className={`flex items-center justify-center text-white px-2 py-2 flex-shrink-0 rounded-full cursor-pointer ${
                  darkMode
                    ? "bg-white hover:bg-yellow-50"
                    : "bg-lime-600 hover:bg-lime-700"
                }`}
              >
                <svg
                  fill={darkMode ? "rgb(76,29,149)" : "white"}
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 512 512"
                >
                  <path d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                </svg>
              </div>
              <div className="flex-grow ml-2">
                <div className="relative w-full">
                  <input
                    type="text"
                    className={`flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10 ${
                      darkMode
                        ? "bg-gray-800 text-white border-none"
                        : "bg-white"
                    }`}
                    value={input}
                    placeholder="Type Something..."
                    onChange={e => {
                      setInput(e.target.value)
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        chatInputHandler()
                      }
                    }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <button
                  className="flex items-center justify-center bg-lime-500 hover:bg-lime-600 rounded-xl font-semibold text-white px-4 py-1 flex-shrink-0"
                  onClick={() => {
                    chatInputHandler()
                  }}
                >
                  <span>Send</span>
                  <span className="ml-2">
                    <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
