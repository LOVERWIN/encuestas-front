import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export default function ChatAgent() {
    
    useEffect(() => {
        createChat({
            webhookUrl: 'http://localhost:5678/webhook/4d199fb0-9576-4945-8682-455bfc0136c5/chat',
            target: '#n8n-chat',
            initialMessages: [
                'Hola! 👋',
                'Soy "Asistente de Encuestas SEE", un experto en la creación de estructuras de encuestas en formato JSON'
            ],
            i18n: {
                en: {
                    title: 'Hi there! 👋',
                    subtitle: "Start a chat. We're here to help you 24/7.",
                    footer: '',
                    getStarted: 'New Conversation',
                    inputPlaceholder: 'Type your question..',
                },
            },
        });
    }, []);
    return (
        <div></div>
    );
}