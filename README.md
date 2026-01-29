# Pet Manager - Sistema de Gerenciamento de Pets e Tutores

Aplicação web desenvolvida em **Angular 20** para gerenciamento completo de pets e tutores com CRUD, autenticação, health checks e arquitetura em camadas.

##  Tecnologias

- **Angular 20** com Standalone Components
- **TypeScript 5.8**
- **Tailwind CSS** + Angular Material
- **RxJS** com BehaviorSubjects
- **HttpClient** para requisições
- **Karma + Jasmine** para testes

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
ng serve
# ou
npm start
# Acesse: http://localhost:4200

# Testes unitários
ng test
```

**API URL**: `https://pet-manager-api.geia.vip`

##  Requisitos Implementados

### Requisitos Gerais

| Requisito                   | Status | Implementação                           |
| --------------------------- | ------ | --------------------------------------- |
| Requisições em tempo real   |      | HttpClient com RxJS                     |
| Layout responsivo           |      | Tailwind CSS (mobile-first)             |
| Framework CSS Tailwind      |      | Totalmente integrado                    |
| Lazy Loading Routes         |      | `loadComponent()` em todas as rotas     |
| Paginação/Scroll infinito   |      | Scroll infinito com detecção automática |
| TypeScript                  |      | TypeScript 5.8                          |
| Organização/Componentização |      | Arquitetura em camadas (Facade Pattern) |
| Testes unitários            |      | Karma + Jasmine (`.spec.ts` files)      |

### Funcionalidades Específicas

#### 1.  Tela Inicial - Listagem de Pets

- **GET /v1/pets** - Implementado
- Cards com foto, nome, espécie, idade
- **Scroll infinito** (10 pets por página)
- **Busca por nome** com debounce (400ms)
- Arquivo: [pets.component.ts](src/app/pages/pets/pets.component.ts)

#### 2.  Tela de Detalhamento do Pet

- **GET /v1/pets/{id}** - Implementado
- **GET /v1/tutores/{id}** - Busca dados do tutor
- Destaque ao nome do pet
- Exibe dados completos do tutor (nome, contato)
- Arquivo: [pet-detail.component.ts](src/app/pages/pets/pet-detail/pet-detail.component.ts)

#### 3.  Tela de Cadastro/Edição de Pet

- **POST /v1/pets** - Cadastro implementado
- **PUT /v1/pets/{id}** - Edição implementada
- **POST /v1/pets/{id}/fotos** - Upload de foto implementado
- Campos: nome, espécie, idade, raça
- Máscaras aplicadas nos campos necessários
- Arquivos: [register-pet](src/app/pages/pets/register-pet/) | [update-pet](src/app/pages/pets/update-pet/)

#### 4.  Tela de Cadastro/Edição de Tutor

- **POST /v1/tutores** - Cadastro implementado
- **PUT /v1/tutores/{id}** - Edição implementada
- **POST /v1/tutores/{id}/fotos** - Upload de foto implementado
- Campos: nome completo, telefone, endereço
- **Vinculação Pet-Tutor**:
  - Lista pets vinculados ao tutor
  - **POST /v1/tutores/{id}/pets/{petId}** - Vincular pet
  - **DELETE /v1/tutores/{id}/pets/{petId}** - Remover vínculo
- Arquivos: [tutors.component.ts](src/app/pages/tutors/tutors.component.ts)

#### 5.  Autenticação

- **POST /autenticacao/login** - Login implementado
- **PUT /autenticacao/refresh** - Refresh token implementado
- AuthGuard protegendo todas as rotas
- Interceptor para injetar token em requisições
- Arquivo: [auth.service.ts](src/app/core/services/auth.service.ts)

### Requisitos Sênior

#### a)  Health Checks e Liveness/Readiness

- **HealthCheckService**: Monitora API a cada 60s
- **HealthCheckInterceptor**: Captura erros de servidor (0, 502, 503, 504)
- **System Unavailable Page**: Página de fallback com tentativa de reconexão automática
- Detecção de 3+ falhas consecutivas
- Redirecionamento automático quando API volta
- Arquivos: [health-check.service.ts](src/app/core/services/health-check.service.ts) | [health-check.interceptor.ts](src/app/core/interceptors/health-check.interceptor.ts)

#### b)  Testes Unitários

- Karma + Jasmine configurados
- Arquivos `.spec.ts` criados para todos os componentes
- Testes básicos de criação e renderização
- Comando: `ng test`

#### c)  Padrão Facade e BehaviorSubject

- **Facade Pattern**:
  - [PetsFacade](src/app/core/facades/pets.facade.ts)
  - [TutorsFacade](src/app/core/facades/tutors.facade.ts)
- **StateService**: Gerenciamento de estado centralizado com BehaviorSubjects
- **Arquitetura em camadas**:
  - `ApiService` → Chamadas HTTP puras
  - `Facade` → Lógica de negócio
  - `StateService` → Gerenciamento de estado reativo
  - `Components` → Apenas apresentação
- Arquivo: [state.service.ts](src/app/core/services/state.service.ts)

## 🏗️ Arquitetura

### Padrões Implementados

- **Standalone Components** - Sem NgModules tradicionais
- **Lazy Loading** - Todas as rotas carregam sob demanda
- **Facade Pattern** - Abstração de lógica de negócio
- **Guard Pattern** - Proteção de rotas (AuthGuard)
- **Interceptor Pattern** - Auth + Health Check
- **BehaviorSubject** - Estado reativo com RxJS

### Estrutura em Camadas

```
┌─────────────────────────────────────┐
│       Components (UI)               │ ← Apresentação
├─────────────────────────────────────┤
│       Facades                       │ ← Lógica de negócio
├─────────────────────────────────────┤
│   StateService (BehaviorSubjects)   │ ← Gerenciamento de estado
├─────────────────────────────────────┤
│       ApiService                    │ ← Chamadas HTTP
└─────────────────────────────────────┘
```

### Estrutura de Pastas

```
src/app/
├── core/                          # Núcleo da aplicação
│   ├── facades/                   # Camada de negócio
│   │   ├── pets.facade.ts
│   │   └── tutors.facade.ts
│   ├── guards/                    # Proteção de rotas
│   │   └── auth.guard.ts
│   ├── interceptors/              # HTTP interceptors
│   │   ├── auth.interceptor.ts
│   │   └── health-check.interceptor.ts
│   ├── models/                    # Tipos e interfaces
│   │   ├── auth.model.ts
│   │   ├── pets.model.ts
│   │   └── tutores.model.ts
│   └── services/                  # Serviços base
│       ├── api-service.ts         # Chamadas HTTP
│       ├── auth.service.ts
│       ├── health-check.service.ts
│       ├── state.service.ts       # Estado com BehaviorSubjects
│       └── util.service.ts
├── pages/                         # Páginas da aplicação
│   ├── auth/login/
│   ├── home/
│   ├── pets/
│   │   ├── pets.component.*       # Lista + scroll infinito
│   │   ├── pet-detail/
│   │   ├── register-pet/
│   │   └── update-pet/
│   ├── tutors/
│   │   ├── tutors.component.*
│   │   ├── tutor-detail/
│   │   ├── register-tutor/
│   │   └── update-tutors/
│   └── system-unavailable/        # Fallback health check
├── components_utils/              # Componentes reutilizáveis
│   ├── header/
│   ├── footer/
│   ├── loader-personalized/
│   └── health-status-indicator/
└── shared/
    └── shared.module.ts
```

## 🎯 Priorização e Decisões

### Prioridade MÁXIMA 

1. **Atendimento aos requisitos** - Todos implementados
2. **Organização e arquitetura** - Facade Pattern + Camadas
3. **Componentização** - Componentes reutilizáveis e standalone
4. **Semântica e legibilidade** - Código limpo e documentado
5. **Escalabilidade** - Estrutura preparada para crescimento

### Destaques Técnicos

- **Scroll Infinito**: Implementado com detecção de scroll + paginação
- **Busca Reativa**: Debounce de 400ms para otimizar requisições
- **Health Checks**: Sistema completo de monitoramento e recuperação
- **Estado Reativo**: BehaviorSubjects para gerenciamento de estado
- **Lazy Loading**: 100% das rotas carregam sob demanda
- **Responsividade**: Mobile-first com Tailwind CSS
- **Upload de Fotos**: Implementado para pets e tutores
- **Vinculação Pet-Tutor**: CRUD completo de relacionamentos

### Boas Práticas Aplicadas

-  Standalone Components (Angular 20)
-  Signals para reatividade local
-  Typed Forms e Models
-  Error Handling centralizado
-  Guards e Interceptors
-  Service Layer separado
-  Componentização modular
-  CSS utilitário (Tailwind)
-  Testes unitários


## Observações

### O que foi implementado

 **100% dos requisitos obrigatórios**
 **100% dos requisitos sênior**
 Todos os endpoints da API integrados
 Upload de fotos funcional
 Vinculação Pet-Tutor completa
 Sistema de health check robusto
 Arquitetura escalável com Facade Pattern
 Estado reativo com BehaviorSubjects
 Testes unitários básicos

### Diferenciais Implementados

- Health Check com recuperação automática
- Scroll infinito otimizado
- Busca reativa com debounce
- Interface moderna com Tailwind + Material
- Indicador de status de saúde da API
- Página de sistema indisponível
- Arquitetura em camadas bem definida

---

## Deploy

Para colocar essa aplicação em produção, eu optaria por **Hostinger**.

- Já usei em projetos anteriores e gostei bastante da velocidade do servidor
- Fiz deploy de um sistema completo (FastAPI no backend + Angular no frontend) e funcionou perfeitamente
- Configurando com GitHub, o deploy fica automático também


---

**Desenvolvido por Wagner Ferreira com Angular 20 + TypeScript + Tailwind CSS**
