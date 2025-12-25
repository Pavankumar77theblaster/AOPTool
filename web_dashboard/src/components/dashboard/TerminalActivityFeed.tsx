/**
 * Live Terminal Activity Feed
 * Shows raw logs to prove the tool is working in the background
 */

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const TerminalActivityFeed: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate log entries (replace with real data from API/WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          message: getRandomMessage()
        };

        setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
      }
    }, 3000); // New log every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-scroll to bottom (unless paused)
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const getRandomMessage = () => {
    const messages = [
      'Initializing Nmap port scan on target 192.168.1.100',
      'Discovered 22 open ports, analyzing services...',
      'SQL injection test completed - No vulnerabilities found',
      'XSS detection running on /login endpoint',
      'Technology detected: Nginx 1.21.3, PHP 8.1.2',
      'Subdomain enumeration found 12 subdomains',
      'CVE-2023-1234 vulnerability detected - CRITICAL',
      'Evidence collected: screenshot_login_xss.png',
      'Attack sequence completed successfully',
      'Generating CVSS scores for findings...',
      'Metasploit module executed - shell obtained',
      'Directory brute force: 47 directories discovered',
      'Certificate transparency scan completed',
      'WAF detected: Cloudflare, adjusting payload'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-success-400';
      case 'warning':
        return 'text-warning-400';
      case 'error':
        return 'text-danger-400';
      default:
        return 'text-primary-400';
    }
  };

  const getLevelSymbol = (level: string) => {
    switch (level) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '›';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-sm font-mono text-success-400">system@aoptool:~$</h3>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-xs px-2 py-1 rounded bg-dark-hover hover:bg-dark-border text-dark-muted transition"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Terminal window */}
      <div
        ref={scrollRef}
        className="flex-1 bg-black/50 border border-dark-border rounded-lg p-3 overflow-y-auto font-mono text-xs space-y-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {logs.length === 0 ? (
          <div className="text-dark-muted text-center py-8">
            Waiting for activity...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="animate-fade-in-up opacity-0"
              style={{
                animation: 'fadeInUp 0.3s ease-out forwards'
              }}
            >
              <span className="text-dark-muted">
                [{format(log.timestamp, 'HH:mm:ss')}]
              </span>{' '}
              <span className={getLevelColor(log.level)}>
                {getLevelSymbol(log.level)}
              </span>{' '}
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Status indicator */}
      <div className="mt-2 text-xs text-dark-muted font-mono flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-warning-500' : 'bg-success-500 animate-pulse'}`}></div>
          {isPaused ? 'Paused' : 'Live'}
        </div>
        <span>•</span>
        <span>{logs.length} entries</span>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TerminalActivityFeed;
