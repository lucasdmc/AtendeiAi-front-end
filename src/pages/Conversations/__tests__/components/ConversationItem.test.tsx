import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationItem } from '../../components/ConversationsList/ConversationItem';
import { Conversation } from '../../types';

// Mock dos utilitários
jest.mock('../../utils', () => ({
  getInitials: (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(),
  formatTime: () => '14:30',
  getStandardFlag: () => ({ name: 'Manual', color: '#3B82F6', icon: () => null }),
  truncateText: (text: string, length: number) => text.length > length ? text.substring(0, length) + '...' : text
}));

// Mock dos utilitários de acessibilidade
jest.mock('../../utils/accessibility', () => ({
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' '
  }
}));

const mockConversation: Conversation = {
  _id: 'conv-1',
  customer_name: 'João Silva',
  customer_phone: '47999999999',
  last_message: {
    content: 'Olá, como posso ajudar?',
    timestamp: '2024-01-15T14:30:00Z',
    sender_type: 'customer'
  },
  unread_count: 2,
  updated_at: '2024-01-15T14:30:00Z',
  created_at: '2024-01-15T14:30:00Z',
  status: 'active',
  assigned_user_id: null
};

const defaultProps = {
  conversation: mockConversation,
  isSelected: false,
  onSelect: jest.fn(),
  onMenuClick: jest.fn(),
  showMenu: false,
  onMenuAction: jest.fn()
};

describe('ConversationItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render conversation item correctly', () => {
    render(<ConversationItem {...defaultProps} />);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Olá, como posso ajudar?')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // unread count
  });

  it('should show phone number when name is not available', () => {
    const conversationWithoutName = {
      ...mockConversation,
      customer_name: undefined
    };
    
    render(<ConversationItem {...defaultProps} conversation={conversationWithoutName} />);
    
    expect(screen.getByText('47999999999')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    render(<ConversationItem {...defaultProps} />);
    
    const item = screen.getByRole('button');
    fireEvent.click(item);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockConversation);
  });

  it('should call onSelect when Enter key is pressed', () => {
    render(<ConversationItem {...defaultProps} />);
    
    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: 'Enter' });
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockConversation);
  });

  it('should call onSelect when Space key is pressed', () => {
    render(<ConversationItem {...defaultProps} />);
    
    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: ' ' });
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockConversation);
  });

  it('should apply selected styles when isSelected is true', () => {
    render(<ConversationItem {...defaultProps} isSelected={true} />);
    
    const item = screen.getByRole('button');
    expect(item).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('should show menu button on hover and call onMenuClick', () => {
    render(<ConversationItem {...defaultProps} />);
    
    const menuButton = screen.getByLabelText(/Abrir menu para conversa/);
    fireEvent.click(menuButton);
    
    expect(defaultProps.onMenuClick).toHaveBeenCalledWith('conv-1');
  });

  it('should not show unread count when zero', () => {
    const conversationWithoutUnread = {
      ...mockConversation,
      unread_count: 0
    };
    
    render(<ConversationItem {...defaultProps} conversation={conversationWithoutUnread} />);
    
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should show 99+ for unread count over 99', () => {
    const conversationWithManyUnread = {
      ...mockConversation,
      unread_count: 150
    };
    
    render(<ConversationItem {...defaultProps} conversation={conversationWithManyUnread} />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ConversationItem {...defaultProps} />);
    
    const item = screen.getByRole('button');
    expect(item).toHaveAttribute('aria-selected', 'false');
    expect(item).toHaveAttribute('tabIndex', '0');
    expect(item).toHaveAttribute('aria-label');
  });
});
