import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Contacts from '../pages/Contacts'
import api from '../api/axios'
import { useAuth } from '../stores/auth'

vi.mock('../api/axios')
vi.mock('../stores/auth')

describe('Contacts', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { id: 'me' } })
    api.get.mockResolvedValue({
      data: [
        { id: 'u1', firstName: 'John', lastName: 'Doe' },
        { id: 'me' },
        { id: 'u2', firstName: 'Jane', lastName: 'Smith' }
      ]
    })
  })

  it('renders and highlights contacts correctly', async () => {
    const onSelect = vi.fn()
    render(<Contacts onSelect={onSelect} selectedUserId="u2" />)
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/users'))
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    fireEvent.click(screen.getByText('John Doe'))
    expect(onSelect).toHaveBeenCalledWith('u1')
  })
})
