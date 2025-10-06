import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationItem } from '../../components/ConversationsList/ConversationItem';

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

const defaultProps = {
  id: 'conv-1',
  contactName: 'João Silva',
  lastActiveAt: '2024-01-15T14:30:00Z',
  sectorLabel: 'Setor Teste',
  isSelected: false,
  onClick: jest.fn(),
  onContextMenu: jest.fn(),
  isUnread: true
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
    render(<ConversationItem {...defaultProps} contactName="" />);
  });

  it('should call onClick when clicked', () => {
    render(<ConversationItem {...defaultProps} />);

    const item = screen.getByRole('button');
    fireEvent.click(item);

    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('should call onClick when Enter key is pressed', () => {
    render(<ConversationItem {...defaultProps} />);

    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: 'Enter' });

    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('should call onClick when Space key is pressed', () => {
    render(<ConversationItem {...defaultProps} />);

    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: ' ' });

    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('should apply selected styles when isSelected is true', () => {
    render(<ConversationItem {...defaultProps} isSelected={true} />);
    
    const item = screen.getByRole('button');
    expect(item).toHaveClass('bg-blue-50', 'border-blue-200');
  });


  it('should not show unread count when zero', () => {
    render(<ConversationItem {...defaultProps} isUnread={false} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should show 99+ for unread count over 99', () => {
    render(<ConversationItem {...defaultProps} isUnread={true} />);

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
