import { 
  getInitials, 
  formatTime, 
  formatDate, 
  truncateText,
  filterConversationsBySearch,
  getUnreadConversationsCount,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber
} from '../../utils/helpers';

describe('Helper Functions', () => {
  describe('getInitials', () => {
    it('should return initials from full name', () => {
      expect(getInitials('João Silva')).toBe('JS');
      expect(getInitials('Maria Santos Oliveira')).toBe('MS');
    });

    it('should handle single name', () => {
      expect(getInitials('João')).toBe('J');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('U');
    });

    it('should limit to 2 characters', () => {
      expect(getInitials('Ana Beatriz Carlos Dias')).toBe('AB');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const timestamp = '2024-01-15T14:30:00Z';
      const result = formatTime(timestamp);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const timestamp = '2024-01-15T14:30:00Z';
      const result = formatDate(timestamp);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'Este é um texto muito longo que precisa ser truncado';
      expect(truncateText(longText, 20)).toBe('Este é um texto muit...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Texto curto';
      expect(truncateText(shortText, 20)).toBe('Texto curto');
    });

    it('should handle empty text', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('filterConversationsBySearch', () => {
    const mockConversations = [
      { _id: '1', customer_name: 'João Silva', customer_phone: '47999999999' },
      { _id: '2', customer_name: 'Maria Santos', customer_phone: '47888888888' },
      { _id: '3', customer_name: null, customer_phone: '47777777777' }
    ] as any[];

    it('should filter by name', () => {
      const result = filterConversationsBySearch(mockConversations, 'João');
      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toBe('João Silva');
    });

    it('should filter by phone', () => {
      const result = filterConversationsBySearch(mockConversations, '47999');
      expect(result).toHaveLength(1);
      expect(result[0].customer_phone).toBe('47999999999');
    });

    it('should return all when search is empty', () => {
      const result = filterConversationsBySearch(mockConversations, '');
      expect(result).toHaveLength(3);
    });
  });

  describe('getUnreadConversationsCount', () => {
    const mockConversations = [
      { _id: '1', unread_count: 5 },
      { _id: '2', unread_count: 0 },
      { _id: '3', unread_count: 2 },
      { _id: '4' } // sem unread_count
    ] as any[];

    it('should count conversations with unread messages', () => {
      const result = getUnreadConversationsCount(mockConversations);
      expect(result).toBe(2);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Brazilian phone numbers', () => {
      expect(isValidPhone('+5547999999999')).toBe(true);
      expect(isValidPhone('47999999999')).toBe(true);
      expect(isValidPhone('(47) 99999-9999')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('invalid')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 11-digit numbers', () => {
      expect(formatPhoneNumber('47999999999')).toBe('(47) 99999-9999');
    });

    it('should format 10-digit numbers', () => {
      expect(formatPhoneNumber('4733334444')).toBe('(47) 3333-4444');
    });

    it('should return original for invalid lengths', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });
});
