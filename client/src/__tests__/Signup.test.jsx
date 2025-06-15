// client/src/__tests__/Signup.test.jsx
import React from 'react'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Signup from '../pages/Signup'
import api from '../api/axios'
import { useAuth } from '../stores/auth'

// Mock modules
vi.mock('../api/axios')
vi.mock('../stores/auth')

describe('Signup', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    // Whenever useAuth() is called, return an object that has login()
    useAuth.mockReturnValue({ login: mockLogin })

    // Reset and then set up two calls:
    //  - first resolves the register
    //  - second resolves the login with a token
    api.post.mockReset()
    api.post
      .mockResolvedValueOnce({})                     // /auth/register
      .mockResolvedValueOnce({ data: { token: 'tok' } }) // /auth/login
  })

  it('shows validation errors for empty fields', () => {
    render(<Signup onSwitch={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }))
    expect(screen.getByText('All fields are required.')).toBeInTheDocument()
  })

  it('shows password length error', () => {
    render(<Signup onSwitch={() => {}} />)

    // Fill all other fields, leave password short
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'A' } })
    fireEvent.change(screen.getByPlaceholderText('Last Name'),  { target: { value: 'B' } })
    fireEvent.change(screen.getByPlaceholderText('Email'),      { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('Username'),   { target: { value: 'u' } })
    fireEvent.change(screen.getByPlaceholderText('Password'),   { target: { value: '123' } })

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }))
    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument()
  })

  it('registers then auto‐logs in on success', async () => {
    render(<Signup onSwitch={() => {}} />)

    // Fill valid form
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last Name'),  { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Email'),      { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Username'),   { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByPlaceholderText('Password'),   { target: { value: 'password1' } })

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }))

    // Wait for both API calls and login() to fire
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(2)
      expect(mockLogin).toHaveBeenCalledWith('tok')
    })

    // And that they were called with the correct args
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/auth/register',
      {
        firstName: 'John',
        lastName:  'Doe',
        email:     'john@example.com',
        username:  'johndoe',
        password:  'password1'
      }
    )
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/auth/login',
      {
        username: 'johndoe',
        password: 'password1'
      }
    )
  })
})
