# 🚀 Aplicação Angular com Login e Autenticação

Aplicação Angular 20 com sistema completo de autenticação, usando Angular Material e Tailwind CSS.

## ✨ Recursos Implementados

### 🔐 Autenticação

- **Login Component**: Tela de login responsiva com validação de formulários
- **Auth Service**: Gerenciamento completo de autenticação
  - Login via API
  - Refresh token automático
  - Renovação 1 minuto antes da expiração
  - Armazenamento seguro em localStorage
- **Auth Guard**: Proteção de rotas
- **Auth Interceptor**: Injeção automática do token Bearer em todas as requisições

### 🏠 Home Dashboard

- Dashboard completo com estatísticas
- Sidebar com navegação
- Cards informativos
- Menu de usuário
- Design responsivo

### 🎨 UI/UX

- **Angular Material**: Componentes completos no SharedModule
- **Tailwind CSS**: Utility-first CSS framework
- **Design Responsivo**: Mobile-first approach
- **Tema Customizado**: Paleta de cores personalizada

## 📁 Estrutura do Projeto

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          # Guard de proteção de rotas
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Interceptor HTTP
│   ├── models/
│   │   └── auth.model.ts          # Interfaces de autenticação
│   └── services/
│       └── auth.service.ts        # Serviço de autenticação
├── features/
│   ├── auth/
│   │   └── login/                 # Componente de login
│   └── home/                      # Componente home/dashboard
└── shared/
    └── shared.module.ts           # Módulo compartilhado com Material
```

## 🛠️ Tecnologias

- **Angular 20**: Framework principal
- **Angular Material 20**: Componentes UI
- **Tailwind CSS**: Estilização
- **RxJS**: Programação reativa
- **TypeScript**: Linguagem

## 🔌 API Endpoints

```typescript
Base URL: https://pet-manager-api.geia.vip

POST /autenticacao/login
Body: { email: string, password: string }
Response: { token, refreshToken, expiresIn, user }

PUT /autenticacao/refresh
Body: { refreshToken: string }
Response: { token, refreshToken, expiresIn }
```

## 💻 Como Usar

### Desenvolvimento

```bash
ng serve
```

A aplicação estará disponível em `http://localhost:4200`

### Login

1. Acesse `/login`
2. Digite email e senha
3. O token será armazenado automaticamente
4. Você será redirecionado para `/home`

### Logout

Clique no ícone do usuário no header e selecione "Sair"

## 🔒 Segurança

- Tokens armazenados em localStorage
- Renovação automática antes da expiração
- Proteção de rotas com guard
- Interceptor para injeção automática do token
- Retry automático em caso de 401

## 📦 Componentes Material Disponíveis

O SharedModule exporta todos estes componentes:

- Button, Icon, Toolbar
- Sidenav, List, Card
- Form Field, Input, Select
- Checkbox, Radio, Datepicker
- Table, Paginator, Sort
- Dialog, Snackbar
- Progress Spinner/Bar
- Tooltip, Menu, Tabs
- Expansion, Chips, Autocomplete
- Slide Toggle, Slider, Badge

## 🎨 Uso do SharedModule

```typescript
import { SharedModule } from "./shared/shared.module";

@Component({
  imports: [SharedModule],
})
export class MyComponent {}
```

## 📝 Exemplo de Uso do AuthService

```typescript
import { AuthService } from "@core/services/auth.service";

export class MyComponent {
  private authService = inject(AuthService);

  login() {
    this.authService.login({ email, password }).subscribe({
      next: (res) => console.log("Login success", res),
      error: (err) => console.error("Login error", err),
    });
  }

  logout() {
    this.authService.logout();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }
}
```

## 🚀 Deploy

```bash
ng build --configuration production
```

Os arquivos compilados estarão em `dist/`
