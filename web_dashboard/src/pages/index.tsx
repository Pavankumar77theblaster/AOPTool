/**
 * AOPTool Web Dashboard - Home Page
 * Main landing page for the autonomous pentesting platform
 */

import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [apiStatus, setApiStatus] = useState<string>('checking...');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Check API health on component mount
    fetch(`${apiUrl}/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setApiStatus('✅ Connected');
        } else {
          setApiStatus('⚠️  API responding but unhealthy');
        }
      })
      .catch(err => {
        setApiStatus('❌ Cannot connect to API');
        console.error('API health check failed:', err);
      });
  }, [apiUrl]);

  return (
    <>
      <Head>
        <title>AOPTool - AI-Orchestrated Pentesting</title>
        <meta name="description" content="Autonomous penetration testing platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>
            AOPTool
          </h1>

          <p style={styles.subtitle}>
            AI-Orchestrated Autonomous Pentesting Tool
          </p>

          <div style={styles.card}>
            <h2>🚀 System Status</h2>
            <div style={styles.statusGrid}>
              <div>
                <strong>Control Plane API:</strong> {apiStatus}
              </div>
              <div>
                <strong>Environment:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>API URL:</strong> {apiUrl}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2>📋 Quick Start</h2>
            <ol style={styles.list}>
              <li>Ensure all Docker containers are running</li>
              <li>Add targets to the whitelist</li>
              <li>Create an attack plan</li>
              <li>Monitor execution in real-time</li>
              <li>Review reports and evidence</li>
            </ol>
          </div>

          <div style={styles.card}>
            <h2>⚠️  Important</h2>
            <p style={styles.warning}>
              This tool is for <strong>authorized security testing only</strong>.
              Unauthorized use is illegal and unethical.
            </p>
          </div>

          <div style={styles.footer}>
            <p>
              <strong>Version:</strong> 1.0.0-alpha |
              <strong> Phase:</strong> Development |
              <a href="/docs" style={styles.link}> Documentation</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

// Inline styles for initial setup (will be replaced with Tailwind CSS later)
const styles = {
  main: {
    minHeight: '100vh',
    padding: '4rem 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  container: {
    maxWidth: '800px',
    width: '100%',
    padding: '0 2rem',
  },
  title: {
    fontSize: '4rem',
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(90deg, #00ff88, #00ccff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '1.5rem',
    textAlign: 'center' as const,
    color: '#888',
    marginBottom: '3rem',
  },
  card: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  statusGrid: {
    display: 'grid',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  list: {
    paddingLeft: '1.5rem',
    lineHeight: '1.8',
  },
  warning: {
    color: '#ffaa00',
    margin: 0,
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '3rem',
    color: '#666',
  },
  link: {
    color: '#00ccff',
    textDecoration: 'none',
  },
};
