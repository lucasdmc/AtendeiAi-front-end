# Imagens Estáticas - Assets

Esta pasta contém imagens que são importadas diretamente nos componentes React e processadas pelo bundler (Vite).

## Estrutura de Pastas

- **`logos/`** - Logotipos da empresa, clínicas, parceiros
- **`icons/`** - Ícones do sistema, ícones customizados
- **`backgrounds/`** - Imagens de fundo, patterns, texturas
- **`avatars/`** - Avatares padrão, placeholders de usuário
- **`misc/`** - Outras imagens diversas

## Como Usar

As imagens nesta pasta devem ser importadas nos componentes:

```tsx
// Exemplo de importação e uso
import logoAtendeiAi from '@/assets/images/logos/atendei-ai-logo.png';
import defaultAvatar from '@/assets/images/avatars/default-user.png';

function Header() {
  return (
    <div>
      <img src={logoAtendeiAi} alt="AtendeiAi Logo" />
      <img src={defaultAvatar} alt="Avatar padrão" />
    </div>
  );
}
```

## Vantagens desta Abordagem

- **Otimização automática** - Vite otimiza as imagens durante o build
- **Cache busting** - URLs com hash para controle de cache
- **Tree shaking** - Apenas imagens utilizadas são incluídas no bundle
- **TypeScript support** - Melhor suporte a tipos e autocomplete

## Formatos Recomendados

- **PNG** - Para imagens com transparência, logos, ícones
- **JPG/JPEG** - Para fotos, imagens sem transparência
- **SVG** - Para ícones vetoriais (podem ser importados como componentes)
- **WebP** - Para otimização de performance

## Convenções de Nomenclatura

- Use nomes descritivos em kebab-case: `atendei-ai-logo.png`
- Inclua dimensões quando relevante: `user-avatar-128x128.png`
- Use prefixos para variações: `whatsapp-icon-green.svg`
