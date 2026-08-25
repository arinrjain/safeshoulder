'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TeenHeader } from '@/components/TeenHeader';
import { createClient } from '@/lib/supabase';

export default function TeenSupportPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hey! I'm Aisha, your 24/7 support companion. 💙\n\nI'm here to listen, validate, and help you navigate whatever you're dealing with—whether it's bullying, peer pressure, social anxiety, or just feeling overwhelmed at school.\n\nWhat's on your mind right now?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = message;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);

    // Call real backend API
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: userMessage,
          domain: 'school_bullying'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat API error response:', errorText);
        throw new Error(`Chat API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);

          // Split on \n\n which marks the end of each SSE message
          const messages = buffer.split('\n\n');
          // Keep the last incomplete message in buffer
          buffer = messages[messages.length - 1];

          // Process all complete messages
          for (let i = 0; i < messages.length - 1; i++) {
            const msg = messages[i].trim();
            if (!msg.startsWith('data: ')) continue;

            const data = msg.slice(6); // Remove 'data: ' prefix
            if (data === '[DONE]') continue;
            if (data.startsWith('[META]')) continue;

            // Add the data by reading from previous message content
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === 'assistant') {
                // Append to existing assistant message
                lastMessage.content += data;
              } else {
                // Create new assistant message
                newMessages.push({ role: 'assistant', content: data });
              }
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TeenHeader />
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <div
        className="hidden md:block"
        style={{
          width: '300px',
          borderRight: '1px solid var(--color-border)',
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Quick Access</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/teen/resources"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            📚 Coping Strategies
          </Link>
          <Link
            href="/teen/circles"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-border)',
            }}
          >
            👥 Find a Peer Circle
          </Link>
          <Link
            href="/teen/story"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-border)',
            }}
          >
            📖 My Story
          </Link>
        </div>

        {/* Crisis Support */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-accent)',
          }}
        >
          <p style={{ color: 'var(--color-accent)', fontWeight: '600', marginBottom: '0.5rem' }}>🆘 In Crisis?</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            If you're having thoughts of self-harm, we're here for you.
          </p>
          <a
            href="tel:988"
            style={{
              display: 'block',
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            Call 988 (Suicide Lifeline)
          </a>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '0.75rem',
              }}
            >
              {msg.role === 'assistant' && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    backgroundColor: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}
                >
                  🤗
                </div>
              )}

              <div
                style={{
                  maxWidth: '70%',
                  padding: '0.875rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                  borderBottomLeftRadius: msg.role === 'assistant' ? 0 : 'var(--radius-lg)',
                  borderBottomRightRadius: msg.role === 'user' ? 0 : 'var(--radius-lg)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  backgroundColor: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}
              >
                🤗
              </div>
              <div
                style={{
                  padding: '0.875rem 1.25rem',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  borderBottomLeftRadius: 0,
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--color-text-secondary)',
                      borderRadius: '9999px',
                      animation: 'pulse 1.4s infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--color-text-secondary)',
                      borderRadius: '9999px',
                      animation: 'pulse 1.4s infinite',
                      animationDelay: '0.2s',
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--color-text-secondary)',
                      borderRadius: '9999px',
                      animation: 'pulse 1.4s infinite',
                      animationDelay: '0.4s',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '1.5rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me what's going on..."
              style={{
                flex: 1,
                padding: '0.875rem 1.25rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              style={{
                padding: '0.875rem 1.75rem',
                backgroundColor: isLoading || !message.trim() ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontWeight: '600',
                cursor: isLoading || !message.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      </div>
    </>
  );
}
