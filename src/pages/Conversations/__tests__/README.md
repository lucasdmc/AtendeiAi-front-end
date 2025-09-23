# Testes - Conversations

Este diretório contém os testes unitários para os componentes e hooks da página Conversations.

## Estrutura

```
__tests__/
├── components/          # Testes de componentes React
│   ├── ConversationItem.test.tsx
│   └── ...
├── hooks/              # Testes de hooks customizados
│   ├── useConversationMenu.test.ts
│   └── ...
├── utils/              # Testes de funções utilitárias
│   ├── helpers.test.ts
│   └── ...
├── setup.ts            # Configuração global dos testes
└── README.md           # Este arquivo
```

## Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm test -- --watch

# Executar testes com coverage
npm test -- --coverage

# Executar testes específicos
npm test ConversationItem
```

## Cobertura de Testes

### Componentes Testados
- ✅ ConversationItem
- 🔄 ConversationMenu (próximo)
- 🔄 MessageItem (próximo)
- 🔄 MessageMenu (próximo)

### Hooks Testados
- ✅ useConversationMenu
- 🔄 useMessageMenu (próximo)
- 🔄 useConversationFilters (próximo)

### Utilitários Testados
- ✅ helpers.ts
- 🔄 errorHandling.ts (próximo)
- 🔄 accessibility.ts (próximo)

## Convenções

### Nomenclatura
- Arquivos de teste: `*.test.ts` ou `*.test.tsx`
- Describe blocks: Nome do componente/hook/função
- Test cases: Descrição do comportamento esperado

### Estrutura dos Testes
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  it('should do something when condition', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Mocks
- Utilitários são mockados para isolar testes
- APIs externas são mockadas
- Console.log é suprimido por padrão

## Bibliotecas Utilizadas

- **@testing-library/react**: Testes de componentes React
- **@testing-library/jest-dom**: Matchers customizados
- **@testing-library/user-event**: Simulação de interações do usuário
- **Jest**: Framework de testes

## Próximos Passos

1. Adicionar testes para todos os componentes principais
2. Implementar testes de integração
3. Adicionar testes E2E com Cypress/Playwright
4. Configurar CI/CD para executar testes automaticamente
5. Estabelecer meta de cobertura mínima (80%+)

## Exemplos de Teste

### Componente React
```typescript
it('should render with correct props', () => {
  render(<Component prop="value" />);
  expect(screen.getByText('value')).toBeInTheDocument();
});
```

### Hook Customizado
```typescript
it('should return expected value', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current.value).toBe(expectedValue);
});
```

### Função Utilitária
```typescript
it('should format input correctly', () => {
  const result = formatFunction('input');
  expect(result).toBe('expectedOutput');
});
```

