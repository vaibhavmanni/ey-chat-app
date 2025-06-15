import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Signup from '../pages/Signup'
import api from '../api/axios'

vi.mock('../api/axios')

describe('Signup', () => {
  beforeEach(() => {
    api.post.mockResolvedValue({})
  })

  it('shows validation errors for empty fields', () => {
    render(<Signup onSwitch={()=>{}} />)
    fireEvent.click(screen.getByText('Create Account'))
    expect(screen.getByText('All fields are required.')).toBeInTheDocument()
  })

  it('shows password length error', () => {
    render(<Signup onSwitch={()=>{}} />)
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'A' } })
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'B' } })
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'u' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '123' } })
    fireEvent.click(screen.getByText('Create Account'))
    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument()
  })

  it('submits and switches to login on success', async () => {
    const mockSwitch = vi.fn()
    render(<Signup onSwitch={mockSwitch} />)
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last Name'),  { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Email'),      { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('Username'),   { target: { value: 'johndoe' } })
    fireEvent.change(screen.getByPlaceholderText('Password'),   { target: { value: 'abcdef' } })
    fireEvent.click(screen.getByText('Create Account'))
    await screen.findByText('Sign Up')
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      firstName: 'John', lastName: 'Doe',
      email: 'a@b.com', username: 'johndoe', password: 'abcdef'
    })
    expect(mockSwitch).toHaveBeenCalledWith('login')
  })
})
