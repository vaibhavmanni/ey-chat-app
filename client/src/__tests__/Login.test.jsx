// client/src/__tests__/Login.test.jsx
import React from 'react'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from '../pages/Login'
import { useAuth } from '../stores/auth'
import api from '../api/axios'

vi.mock('../stores/auth')
vi.mock('../api/axios')

describe('Login', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin })
    api.post.mockResolvedValue({ data: { token: 'tok' } })
    mockLogin.mockClear()
    api.post.mockClear()
  })

  it('shows validation error if fields empty', () => {
    render(<Login onSwitch={()=>{}} />)
    // click the submit button by role
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }))
    expect(screen.getByText('Username and password are required.')).toBeInTheDocument()
  })

  it('submits and calls login on success', async () => {
    render(<Login onSwitch={()=>{}} />)
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'bob' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'bob' } })
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }))
    // wait for API call / state update
    await screen.findByPlaceholderText('Username')
    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'bob', password: 'bob' })
    expect(mockLogin).toHaveBeenCalledWith('tok')
  })

  it('shows error on invalid credentials', async () => {
    api.post.mockRejectedValueOnce(new Error('fail'))
    render(<Login onSwitch={()=>{}} />)
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'bob' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }))
    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument()
  })
})
