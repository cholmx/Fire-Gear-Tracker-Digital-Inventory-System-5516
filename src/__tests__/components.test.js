import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingScreen from '../components/LoadingScreen'
import ErrorBoundary from '../components/ErrorBoundary'
import DatabaseStatus from '../components/DatabaseStatus'

// Mock SafeIcon
vi.mock('../common/SafeIcon', () => ({
  default: ({ icon, className }) => <div data-testid="safe-icon" className={className}>{icon}</div>
}))

// Mock database
vi.mock('../lib/database', () => ({
  db: {
    healthCheck: vi.fn().mockResolvedValue({
      healthy: true,
      connected: true,
      error: null
    })
  }
}))

describe('Loading Components', () => {
  describe('LoadingScreen', () => {
    it('should render loading screen with default message', () => {
      render(<LoadingScreen />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render custom message', () => {
      render(<LoadingScreen message="Custom loading message" />)
      
      expect(screen.getByText('Custom loading message')).toBeInTheDocument()
    })

    it('should render in non-fullscreen mode', () => {
      const { container } = render(<LoadingScreen fullScreen={false} />)
      
      expect(container.querySelector('.fixed')).toBeNull()
    })
  })

  describe('DatabaseStatus', () => {
    it('should render database status', async () => {
      render(<DatabaseStatus />)
      
      // Should show loading initially
      expect(screen.getByText('Checking...')).toBeInTheDocument()
    })

    it('should render detailed status', async () => {
      render(<DatabaseStatus detailed={true} />)
      
      expect(screen.getByText('Supabase Database')).toBeInTheDocument()
    })
  })
})

// Test component that throws an error
const ErrorThrowingComponent = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  // Suppress console.error for this test
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('should catch and display errors', () => {
    render(
      <ErrorBoundary name="TestBoundary">
        <ErrorThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should render children when no error', () => {
    render(
      <ErrorBoundary name="TestBoundary">
        <div>No error here</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('No error here')).toBeInTheDocument()
  })
})