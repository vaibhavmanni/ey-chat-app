import React from 'react'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'
import { useAuth } from '../stores/auth'

// mock all pages
vi.mock('../pages/Login', () => ({
  default: () => <div data-testid="login-page">Login</div>
}))
vi.mock('../pages/Signup', () => ({
  default: () => <div data-testid="signup-page">Signup</div>
}))
vi.mock('../pages/Contacts', () => ({
  default: ({ onSelect }) => (
    <button data-testid="contact-btn" onClick={()=>onSelect('u1')}>
      Select
    </button>
  )
}))
vi.mock('../pages/Chat', () => ({
  default: ({ selectedUserId }) => (
    <div data-testid="chat-page">Chat with {selectedUserId}</div>
  )
}))

// mock the auth store
vi.mock('../stores/auth')

describe('App component', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading while initializing', () => {
    useAuth.mockReturnValue({ initializing: true, user: null })
    render(<App />)
    expect(screen.getByText(/Loading session…/i)).toBeInTheDocument()
  })

  it('renders Login by default when not authenticated', () => {
    useAuth.mockReturnValue({ initializing: false, user: null })
    render(<App />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('renders Chat when authenticated and user selects a contact', () => {
    useAuth.mockReturnValue({ initializing: false, user: { username: 'bob' } })
    render(<App />)
    fireEvent.click(screen.getByTestId('contact-btn'))
    expect(screen.getByTestId('chat-page')).toHaveTextContent('Chat with u1')
  })
})
