'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { TeenHeader } from '@/components/TeenHeader';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(text: string): string {
  const html = marked(text) as string;
  return DOMPurify.sanitize(html);
}

export default function TeenSupportPage() {
  const router = useRouter();
  const { session, token, loading: authLoading } = useAuth();
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [detectedDomain, setDetectedDomain] = useState<string>('school_bullying');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hey! I'm Aisha, your 24/7 support companion. 💙\n\nI'm here to listen, validate, and help you navigate whatever you're dealing with—whether it's bullying, peer pressure, social anxiety, exam stress, relationship issues, family challenges, body image concerns, or just feeling overwhelmed.\n\nWhat's on your mind right now?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Array<{ id: string; domain: string; summary: string | null; created_at: string }>>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view as the conversation grows, without
  // the input box itself ever moving - it's a fixed-size flex sibling,
  // only the messages column above it scrolls.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  // Redirect immediately once we know for sure there's no active session -
  // previously this page rendered the full chat UI regardless of login
  // state, only failing later (with a raw 401) once a message was sent.
  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [authLoading, session, router]);

  const fetchSessions = async () => {
    if (!session) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('sessions')
        .select('id,domain,summary,created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (session) fetchSessions();
  }, [session]);

  const handleLoadSession = async (sessionIdToLoad: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('messages')
        .select('role,content')
        .eq('session_id', sessionIdToLoad)
        .order('created_at', { ascending: true });

      setSessionId(sessionIdToLoad);
      setMessages(data && data.length > 0 ? data : [
        {
          role: 'assistant',
          content: "Hey! I'm Aisha, your 24/7 support companion. 💙\n\nWhat's on your mind right now?",
        },
      ]);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const handleNewChat = () => {
    setSessionId('');
    setMessages([
      {
        role: 'assistant',
        content: "Hey! I'm Aisha, your 24/7 support companion. 💙\n\nI'm here to listen, validate, and help you navigate whatever you're dealing with—whether it's bullying, peer pressure, social anxiety, or just feeling overwhelmed at school.\n\nWhat's on your mind right now?",
      },
    ]);
    setTimeout(() => fetchSessions(), 300);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;

    // Show the user's message and a loading placeholder immediately -
    // don't make them wait on a network round-trip just to see what they typed.
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: '' }]);
    setMessage('');
    setIsLoading(true);

    // Auto-detect domain from every message (seamless topic switching).
    // Fire-and-forget: the backend also re-detects per-message internally
    // for knowledge retrieval, so this doesn't need to block sending -
    // it only updates the soft "lens" label for the next message.
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/detect-domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.domain) setDetectedDomain(data.domain); })
      .catch((error) => console.error('Domain detection error:', error));

    // Call real backend API - reuse the already-resolved session token
    // instead of asking Supabase to look it up again on every message.
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: userMessage,
          domain: detectedDomain,
          session_id: sessionId || undefined
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat API error response:', errorText);
        let userMessage = 'Sorry, I encountered an error. Please try again.';
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.detail) {
            userMessage = response.status === 402
              ? `${parsed.detail} [Get more messages](/billing)`
              : parsed.detail;
          }
        } catch {
          // Not JSON - keep the generic fallback message
        }
        const err = new Error(`Chat API error: ${response.status} - ${errorText}`);
        (err as Error & { userMessage: string }).userMessage = userMessage;
        throw err;
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

            // Handle metadata or regular content
            if (data.startsWith('[META]')) {
              try {
                const meta = JSON.parse(data.slice(6)); // Remove '[META]' prefix
                if (meta.session_id && !sessionId) {
                  setSessionId(meta.session_id); // Store session_id for future requests
                }
              } catch (e) {
                console.error('Failed to parse metadata:', e);
              }
            } else {
              // Chunks are JSON-encoded by the backend so embedded newlines
              // never collide with the \n\n SSE frame delimiter above.
              let chunkText = data;
              try {
                chunkText = JSON.parse(data);
              } catch (e) {
                // Fallback for any legacy/non-JSON chunk
                console.warn('Chunk was not JSON-encoded, using raw text:', data);
              }
              // Append to the last (assistant) message that was created as a placeholder
              setMessages((prev) => {
                const newMessages = [...prev];
                // Always append to the last message (guaranteed to be assistant placeholder)
                newMessages[newMessages.length - 1].content += chunkText;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const userMessage = (error as Error & { userMessage?: string })?.userMessage
        || 'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: userMessage }]);
    } finally {
      setIsLoading(false);
      // Delay slightly to allow database to persist the session
      setTimeout(() => fetchSessions(), 500);
    }
  };

  if (authLoading) {
    return (
      <>
        <TeenHeader />
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading...
        </div>
      </>
    );
  }

  if (!session) {
    return null; // redirect effect above is already sending them to /login
  }

  return (
    <>
      <TeenHeader />
      <div style={{ display: 'flex', height: 'calc(100dvh - 60px)', backgroundColor: 'var(--color-background)' }}>
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
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          ➕ New Chat
        </button>

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
            If you're having thoughts of self-harm, reach out to these Indian helplines.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a
              href="tel:+919152987821"
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
              iCall (TISS): 9152 987 821
            </a>
            <a
              href="tel:18602662345"
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
              Vandrevala Foundation: 1860-2662-345
            </a>
          </div>
        </div>

        {/* Chat History */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Chats
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loadingSessions ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Loading...</p>
            ) : sessions.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>No previous chats yet</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLoadSession(s.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: sessionId === s.id ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: sessionId === s.id ? 'white' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (sessionId !== s.id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sessionId !== s.id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  <div style={{ fontWeight: sessionId === s.id ? '600' : '500' }}>
                    {s.summary || `${s.domain.replace('_', ' ')}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
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
                  lineHeight: '1.6',
                  minHeight: msg.role === 'assistant' && msg.content === '' && isLoading ? '40px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {msg.role === 'assistant' && msg.content === '' && isLoading ? (
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
                ) : msg.role === 'assistant' ? (
                  <div
                    className="chat-markdown"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
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
