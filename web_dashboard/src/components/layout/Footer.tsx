export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-card border-t border-dark-border px-6 py-4 mt-auto">
      <div className="flex items-center justify-between text-sm text-dark-muted">
        <div className="flex items-center space-x-4">
          <span>AOPTool v1.0.0</span>
          <span className="text-dark-border">|</span>
          <span>© {currentYear} AOPTool</span>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="/docs"
            className="hover:text-primary-400 transition-colors"
          >
            Documentation
          </a>
          <span className="text-dark-border">|</span>
          <span className="text-xs">
            All actions are logged and audited
          </span>
        </div>
      </div>
    </footer>
  )
}
