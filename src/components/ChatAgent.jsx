import { useState, useRef, useEffect } from 'react';

// Genera un ID de sesión único al cargar el componente
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const WEBHOOK_URL = import.meta.env.VITE_N8N_URL;
// Formato de mensajes que n8n espera para el historial
// Mensajes iniciales (Solo para mostrar en el frontend)
const welcomeMessages = [
    { role: 'assistant', content: 'Hola! 👋' },
    { role: 'assistant', content: 'Soy "Asistente de Encuestas SEE", un experto en creacion de encuestas' }
];

// <-- CAMBIO 1: Función para obtener/crear el Session ID
// Esto se ejecuta solo una vez al cargar el componente.
function getSessionId() {
    let id = sessionStorage.getItem('chatSessionId');
    if (!id) {
        id = generateUUID();
        sessionStorage.setItem('chatSessionId', id);
    }
    return id;
}

// // <-- CAMBIO 2: Función para obtener los mensajes guardados
// Usamos una función "lazy initializer" en useState para que esto 
// se ejecute solo en la carga inicial del componente.
const loadMessages = () => {
    const storedMessages = sessionStorage.getItem('chatMessages');
    if (storedMessages) {
        // Si hay mensajes guardados, los usamos
        return JSON.parse(storedMessages);
    }
    // Si no, usamos los de bienvenida
    return welcomeMessages;
};


export default function ChatAgent() {
    const [isOpen, setIsOpen] = useState(false);
    
    // El estado se inicializa llamando a nuestras funciones
    const [messages, setMessages] = useState(loadMessages);
    const [sessionId] = useState(getSessionId());
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // // <-- CAMBIO 3: Guardar mensajes en sessionStorage
    // Este Effect se ejecuta CADA VEZ que el estado 'messages' cambia.
    useEffect(() => {
        // Convertimos el array de mensajes a un string JSON y lo guardamos.
        sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]); // La dependencia es [messages]

    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);
    
    const toggleChat = () => setIsOpen(!isOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userMessageContent = input.trim();
        if (!userMessageContent) return;

        const newUserMessage = { role: 'user', content: userMessageContent };
        
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${WEBHOOK_URL}?action=sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatInput: userMessageContent,
                    sessionId: sessionId,
                }),
            });

            if (!response.ok) throw new Error("Error en la respuesta del webhook");
            const data = await response.json();
            
            if (data.output) {
                setMessages(prevMessages => [
                    ...prevMessages, 
                    { role: 'assistant', content: data.output }
                ]);
            } else {
                 throw new Error("Respuesta de n8n inválida (se esperaba 'output')");
            }

        } catch (error) {
            console.error("Error al contactar al chat de n8n:", error);
            setMessages(prevMessages => [
                ...prevMessages, 
                { role: 'assistant', content: 'Lo siento, no pude conectarme.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Contenedor fijo en la esquina
        <div className="fixed bottom-1 right-3 z-40">

            {/* --- VENTANA DEL CHAT --- */}
            {isOpen && (
                <div className="w-96 h-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-300">

                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Asistente de Encuestas</h3>
                        <button onClick={toggleChat} className="text-white hover:text-gray-200 text-2xl font-bold" aria-label="Cerrar chat">
                            &times;
                        </button>
                    </div>

                    {/* Lista de Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`py-2 px-4 rounded-2xl max-w-[80%] leading-normal ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-lg'
                                        : 'bg-gray-200 text-gray-800 rounded-bl-lg'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="py-2 px-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-lg">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Formulario de Envío */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            disabled={isLoading}
                            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50" aria-label="Enviar mensaje">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* --- BOTÓN FLOTANTE --- */}
            {!isOpen && (
                <button onClick={toggleChat} className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110" aria-label="Abrir chat">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}