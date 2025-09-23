import { renderHook, act } from '@testing-library/react';
import { useConversationMenu } from '../../hooks/useConversationMenu';

// Mock do console.log para evitar logs nos testes
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('useConversationMenu', () => {
  it('should initialize with no menu open', () => {
    const { result } = renderHook(() => useConversationMenu());
    
    expect(result.current.openMenuId).toBeNull();
  });

  it('should open menu when handleMenuClick is called', () => {
    const { result } = renderHook(() => useConversationMenu());
    
    act(() => {
      result.current.handleMenuClick('conversation-1');
    });
    
    expect(result.current.openMenuId).toBe('conversation-1');
  });

  it('should close menu when clicking same conversation', () => {
    const { result } = renderHook(() => useConversationMenu());
    
    act(() => {
      result.current.handleMenuClick('conversation-1');
    });
    
    expect(result.current.openMenuId).toBe('conversation-1');
    
    act(() => {
      result.current.handleMenuClick('conversation-1');
    });
    
    expect(result.current.openMenuId).toBeNull();
  });

  it('should switch to different conversation menu', () => {
    const { result } = renderHook(() => useConversationMenu());
    
    act(() => {
      result.current.handleMenuClick('conversation-1');
    });
    
    expect(result.current.openMenuId).toBe('conversation-1');
    
    act(() => {
      result.current.handleMenuClick('conversation-2');
    });
    
    expect(result.current.openMenuId).toBe('conversation-2');
  });

  it('should handle menu actions and close menu', () => {
    const { result } = renderHook(() => useConversationMenu());
    const mockConversation = {
      _id: 'conv-1',
      customer_name: 'Test User',
      customer_phone: '47999999999'
    } as any;
    
    act(() => {
      result.current.handleMenuClick('conversation-1');
    });
    
    expect(result.current.openMenuId).toBe('conversation-1');
    
    act(() => {
      result.current.handleMenuAction('archive', mockConversation);
    });
    
    expect(result.current.openMenuId).toBeNull();
  });

  it('should handle different menu actions', () => {
    const { result } = renderHook(() => useConversationMenu());
    const mockConversation = {
      _id: 'conv-1',
      customer_name: 'Test User',
      customer_phone: '47999999999'
    } as any;

    const actions = ['archive', 'delete', 'star', 'pin', 'mute'];
    
    actions.forEach(action => {
      act(() => {
        result.current.handleMenuAction(action, mockConversation);
      });
      
      expect(console.log).toHaveBeenCalledWith(
        `Ação ${action} executada para conversa:`,
        mockConversation
      );
    });
  });
});

