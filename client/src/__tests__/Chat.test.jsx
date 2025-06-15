import React from 'react'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Chat from '../pages/Chat'
import api from '../api/axios'
import { initSocket, sendMessage } from '../api/socket'
import { useAuth } from '../stores/auth'

vi.mock('../api/axios')
vi.mock('../api/socket')
vi.mock('../stores/auth')

describe('Chat component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user:{ id:'me' }, token:'tok' })
    api.get.mockResolvedValue({ data:[
      { id:'a', senderId:'them', receiverId:'me', content:'old', createdAt:'2025-01-01T00:00:00Z' }
    ]})
    initSocket.mockReturnValue({ on:()=>{}, off:()=>{}, disconnect:()=>{} })
    sendMessage.mockClear()
  })

  it('loads and displays initial messages', async () => {
    render(<Chat selectedUserId="them"/>)
    expect(await screen.findByText('old')).toBeInTheDocument()
  })

  it('sends optimistic message and calls sendMessage', async () => {
    render(<Chat selectedUserId="them"/>)
    await screen.findByText('old')
    fireEvent.change(screen.getByPlaceholderText('Type a message…'), {
      target:{ value:'Hello!' }
    })
    fireEvent.click(screen.getByText('Send'))
    expect(screen.getByText('Hello!')).toBeInTheDocument()
    expect(sendMessage).toHaveBeenCalledWith({ to:'them', content:'Hello!' })
  })
})
