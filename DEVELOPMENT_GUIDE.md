# Development Guide

## Overview

This guide provides comprehensive instructions for setting up, developing, and maintaining the Opcha chat application. It covers both frontend (Next.js) and backend (Rails) development workflows.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 18+ (for local frontend development)
- Ruby 3.3+ (for local backend development)

### 1-Minute Setup

```bash
# Clone the repository
git clone <repository-url>
cd opcha-claude-code

# Copy environment file
cp .env.example .env.development

# Start all services
docker-compose up -d

# Setup database
docker-compose exec backend rails db:create db:migrate db:seed

# Access the application
open http://localhost:3000
```

---

## Development Environment Setup

### Docker Development (Recommended)

**Advantages:**
- Consistent environment across team members
- No need to install Ruby/Node.js locally
- Includes PostgreSQL database
- Easy to reset and clean up

**Services:**
- `frontend`: Next.js app on port 3000
- `backend`: Rails API on port 3001
- `db`: PostgreSQL on port 5432

**Common Commands:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Execute commands in containers
docker-compose exec frontend npm install
docker-compose exec backend rails console

# Stop services
docker-compose down

# Reset database
docker-compose exec backend rails db:drop db:create db:migrate db:seed
```

### Local Development

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

**Backend Setup:**
```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3001
```

**Database Setup:**
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Create database user
createuser -d opcha
createdb -U opcha opcha_development
```

---

## Project Structure

```
opcha-claude-code/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js 13+ app directory
│   │   │   ├── page.tsx     # Home page
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── rooms/       # Room pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies
│   └── next.config.ts       # Next.js configuration
├── backend/                 # Rails API application
│   ├── app/
│   │   ├── controllers/     # API controllers
│   │   │   └── api/         # API namespace
│   │   ├── models/          # ActiveRecord models
│   │   └── views/           # View templates (minimal)
│   ├── config/              # Rails configuration
│   │   ├── routes.rb        # API routes
│   │   └── database.yml     # Database configuration
│   ├── db/                  # Database files
│   │   ├── migrate/         # Database migrations
│   │   └── seeds.rb         # Seed data
│   ├── Gemfile              # Ruby dependencies
│   └── Dockerfile           # Container configuration
├── docs/                    # Documentation
├── docker-compose.yml       # Development environment
└── README.md               # Project overview
```

### Key Directories

**Frontend (`frontend/src/`):**
- `app/`: Next.js app router pages and layouts
- `components/`: Reusable React components
- `hooks/`: Custom React hooks for state management
- `lib/`: API client and utility libraries
- `types/`: TypeScript interfaces and type definitions
- `utils/`: Pure utility functions

**Backend (`backend/app/`):**
- `controllers/api/`: REST API endpoints
- `models/`: Database models and business logic
- `views/`: JSON view templates (if needed)

---

## Development Workflow

### Adding New Features

#### 1. Backend API Endpoint

**Step 1: Add Route**
```ruby
# backend/config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    resources :rooms do
      resources :messages
      # Add new nested resource
      resources :reactions, only: [:create, :destroy]
    end
  end
end
```

**Step 2: Create Controller**
```ruby
# backend/app/controllers/api/reactions_controller.rb
class Api::ReactionsController < ApplicationController
  before_action :set_session
  before_action :set_room
  before_action :set_message

  def create
    @reaction = @message.reactions.build(reaction_params)
    @reaction.session = @session

    if @reaction.save
      render json: { reaction: reaction_json(@reaction) }, status: :created
    else
      render json: { 
        error: { 
          message: @reaction.errors.full_messages.join(", "), 
          code: "VALIDATION_ERROR" 
        } 
      }, status: :unprocessable_entity
    end
  end

  private

  def set_message
    @message = @room.messages.find(params[:message_id])
  end

  def reaction_params
    params.require(:reaction).permit(:emoji)
  end

  def reaction_json(reaction)
    {
      id: reaction.id,
      emoji: reaction.emoji,
      session: {
        display_name: reaction.session.display_name,
        nickname: reaction.session.nickname
      },
      created_at: reaction.created_at
    }
  end
end
```

**Step 3: Create Model**
```ruby
# backend/app/models/reaction.rb
class Reaction < ApplicationRecord
  validates :emoji, presence: true
  
  belongs_to :message
  belongs_to :session
  
  # Prevent duplicate reactions from same user
  validates :session_id, uniqueness: { scope: [:message_id, :emoji] }
end
```

**Step 4: Create Migration**
```bash
docker-compose exec backend rails g migration CreateReactions message:references session:references emoji:string
docker-compose exec backend rails db:migrate
```

#### 2. Frontend Integration

**Step 1: Update API Client**
```typescript
// frontend/src/lib/api.ts
class ApiClient {
  // ... existing methods

  // Reaction APIs
  async createReaction(roomId: string, messageId: string, reactionData: { emoji: string }) {
    return this.request<{ reaction: ReactionData }>(`/rooms/${roomId}/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction: reactionData }),
    });
  }

  async deleteReaction(roomId: string, messageId: string, reactionId: string) {
    return this.request(`/rooms/${roomId}/messages/${messageId}/reactions/${reactionId}`, {
      method: 'DELETE',
    });
  }
}

// Add type definitions
interface ReactionData {
  id: number;
  emoji: string;
  session: {
    display_name: string;
    nickname: string;
  };
  created_at: string;
}
```

**Step 2: Create Component**
```tsx
// frontend/src/components/ReactionButton.tsx
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface ReactionButtonProps {
  roomId: string;
  messageId: string;
  onReactionAdd: (reaction: ReactionData) => void;
}

export default function ReactionButton({ roomId, messageId, onReactionAdd }: ReactionButtonProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddReaction = async (emoji: string) => {
    setIsAdding(true);
    try {
      const { data, error } = await apiClient.createReaction(roomId, messageId, { emoji });
      if (data) {
        onReactionAdd(data.reaction);
      } else {
        console.error('Failed to add reaction:', error);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="reaction-picker">
      {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleAddReaction(emoji)}
          disabled={isAdding}
          className="reaction-button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
```

### Database Migrations

**Creating Migrations:**
```bash
# Add new column
docker-compose exec backend rails g migration AddIndexToRooms share_token:index

# Create new table
docker-compose exec backend rails g migration CreateNotifications user:references message:references read:boolean

# Modify existing column
docker-compose exec backend rails g migration ChangeNicknameLimit
```

**Migration Best Practices:**
```ruby
class AddIndexToRooms < ActiveRecord::Migration[8.0]
  def change
    add_index :rooms, :share_token, unique: true
    add_index :rooms, :created_at
    add_index :messages, [:room_id, :created_at]
  end
end

# For data migrations
class MigrateExistingData < ActiveRecord::Migration[8.0]
  def up
    Room.where(share_token: nil).find_each do |room|
      room.update!(share_token: SecureRandom.alphanumeric(6))
    end
  end

  def down
    # Usually irreversible for data migrations
    raise ActiveRecord::IrreversibleMigration
  end
end
```

---

## Testing

### Backend Testing (RSpec)

**Setup:**
```ruby
# backend/Gemfile
group :development, :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
end
```

**Model Tests:**
```ruby
# backend/spec/models/room_spec.rb
require 'rails_helper'

RSpec.describe Room, type: :model do
  describe 'validations' do
    it 'requires a name' do
      room = Room.new
      expect(room).not_to be_valid
      expect(room.errors[:name]).to include("can't be blank")
    end

    it 'limits name to 50 characters' do
      room = Room.new(name: 'a' * 51)
      expect(room).not_to be_valid
      expect(room.errors[:name]).to include("is too long (maximum is 50 characters)")
    end
  end

  describe 'callbacks' do
    it 'generates share_token on creation' do
      room = Room.create!(name: 'Test Room')
      expect(room.share_token).to be_present
      expect(room.share_token.length).to eq(6)
    end
  end
end
```

**Controller Tests:**
```ruby
# backend/spec/controllers/api/rooms_controller_spec.rb
require 'rails_helper'

RSpec.describe Api::RoomsController, type: :controller do
  let(:session) { create(:session) }
  
  before do
    allow(controller).to receive(:current_session_id).and_return(session.session_id)
  end

  describe 'POST #create' do
    context 'with valid params' do
      let(:valid_params) { { room: { name: 'Test Room' } } }

      it 'creates a new room' do
        expect {
          post :create, params: valid_params
        }.to change(Room, :count).by(1)
      end

      it 'returns created room' do
        post :create, params: valid_params
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['room']['name']).to eq('Test Room')
      end
    end

    context 'with invalid params' do
      let(:invalid_params) { { room: { name: '' } } }

      it 'returns validation error' do
        post :create, params: invalid_params
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']['code']).to eq('VALIDATION_ERROR')
      end
    end
  end
end
```

**Running Tests:**
```bash
# Run all tests
docker-compose exec backend rspec

# Run specific test file
docker-compose exec backend rspec spec/models/room_spec.rb

# Run with coverage
docker-compose exec backend rspec --format documentation
```

### Frontend Testing (Jest + React Testing Library)

**Setup:**
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0"
  }
}
```

**Component Tests:**
```tsx
// frontend/src/components/__tests__/CreateRoomModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateRoomModal from '../CreateRoomModal';

const mockCreateRoom = jest.fn();

describe('CreateRoomModal', () => {
  beforeEach(() => {
    mockCreateRoom.mockClear();
  });

  it('renders modal when open', () => {
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={() => {}}
        onCreateRoom={mockCreateRoom}
      />
    );

    expect(screen.getByText('新しいルームを作成')).toBeInTheDocument();
    expect(screen.getByLabelText('ルーム名')).toBeInTheDocument();
  });

  it('calls onCreateRoom when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={() => {}}
        onCreateRoom={mockCreateRoom}
      />
    );

    const input = screen.getByLabelText('ルーム名');
    const submitButton = screen.getByRole('button', { name: '作成' });

    await user.type(input, 'Test Room');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateRoom).toHaveBeenCalledWith('Test Room');
    });
  });

  it('prevents submission with empty name', async () => {
    const user = userEvent.setup();
    
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={() => {}}
        onCreateRoom={mockCreateRoom}
      />
    );

    const submitButton = screen.getByRole('button', { name: '作成' });
    expect(submitButton).toBeDisabled();
  });
});
```

**Hook Tests:**
```tsx
// frontend/src/hooks/__tests__/useSession.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from '../useSession';
import { apiClient } from '@/lib/api';

jest.mock('@/lib/api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches session on mount', async () => {
    mockApiClient.getSession.mockResolvedValue({
      data: {
        session: {
          id: 1,
          session_id: 'abc123',
          display_name: 'TEST1234',
          nickname: 'Test User',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    });

    const { result } = renderHook(() => useSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nickname).toBe('Test User');
    expect(result.current.displayName).toBe('TEST1234');
  });
});
```

**Running Tests:**
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test CreateRoomModal.test.tsx

# Run in watch mode
npm test -- --watch
```

---

## Code Examples

### Complete Feature Implementation

Here's a complete example of adding a "room favorites" feature:

#### 1. Backend Implementation

**Migration:**
```ruby
# backend/db/migrate/xxx_create_room_favorites.rb
class CreateRoomFavorites < ActiveRecord::Migration[8.0]
  def change
    create_table :room_favorites do |t|
      t.references :room, null: false, foreign_key: true
      t.references :session, null: false, foreign_key: { to_table: :sessions }
      t.timestamps
    end

    add_index :room_favorites, [:room_id, :session_id], unique: true
  end
end
```

**Model:**
```ruby
# backend/app/models/room_favorite.rb
class RoomFavorite < ApplicationRecord
  belongs_to :room
  belongs_to :session

  validates :session_id, uniqueness: { scope: :room_id }
end

# Update existing models
# backend/app/models/room.rb
class Room < ApplicationRecord
  # ... existing code
  has_many :room_favorites, dependent: :destroy
  has_many :favorited_by_sessions, through: :room_favorites, source: :session
end

# backend/app/models/session.rb
class Session < ActiveRecord::SessionStore::Session
  # ... existing code
  has_many :room_favorites, dependent: :destroy
  has_many :favorite_rooms, through: :room_favorites, source: :room
end
```

**Controller:**
```ruby
# backend/app/controllers/api/room_favorites_controller.rb
class Api::RoomFavoritesController < ApplicationController
  before_action :set_session
  before_action :set_room

  def create
    @favorite = @room.room_favorites.build(session: @session)

    if @favorite.save
      render json: { favorited: true }, status: :created
    else
      render json: { 
        error: { 
          message: @favorite.errors.full_messages.join(", "), 
          code: "VALIDATION_ERROR" 
        } 
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @favorite = @room.room_favorites.find_by(session: @session)
    
    if @favorite
      @favorite.destroy
      render json: { favorited: false }
    else
      render json: { 
        error: { 
          message: "Favorite not found", 
          code: "NOT_FOUND" 
        } 
      }, status: :not_found
    end
  end

  private

  def set_room
    @room = Room.kept.find_by!(share_token: params[:room_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: { message: "Room not found", code: "NOT_FOUND" } }, status: :not_found
  end
end
```

**Routes:**
```ruby
# backend/config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    resources :rooms do
      resource :favorite, controller: 'room_favorites', only: [:create, :destroy]
      resources :messages, only: [:index, :create]
    end
  end
end
```

#### 2. Frontend Implementation

**API Client:**
```typescript
// frontend/src/lib/api.ts
class ApiClient {
  // ... existing methods

  async favoriteRoom(roomId: string) {
    return this.request<{ favorited: boolean }>(`/rooms/${roomId}/favorite`, {
      method: 'POST',
    });
  }

  async unfavoriteRoom(roomId: string) {
    return this.request<{ favorited: boolean }>(`/rooms/${roomId}/favorite`, {
      method: 'DELETE',
    });
  }
}
```

**Hook:**
```typescript
// frontend/src/hooks/useFavorites.ts
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = useCallback(async (roomId: string) => {
    setIsLoading(true);
    try {
      const isFavorited = favorites.has(roomId);
      const { data, error } = isFavorited 
        ? await apiClient.unfavoriteRoom(roomId)
        : await apiClient.favoriteRoom(roomId);

      if (data) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (data.favorited) {
            newFavorites.add(roomId);
          } else {
            newFavorites.delete(roomId);
          }
          return newFavorites;
        });
        return true;
      } else {
        console.error('Failed to toggle favorite:', error);
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  }, [favorites]);

  const isFavorited = useCallback((roomId: string) => {
    return favorites.has(roomId);
  }, [favorites]);

  return {
    favorites: Array.from(favorites),
    isFavorited,
    toggleFavorite,
    isLoading,
  };
}
```

**Component:**
```tsx
// frontend/src/components/FavoriteButton.tsx
'use client';

import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  roomId: string;
  className?: string;
}

export default function FavoriteButton({ roomId, className = '' }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite, isLoading } = useFavorites();
  const favorited = isFavorited(roomId);

  const handleToggle = async () => {
    await toggleFavorite(roomId);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`favorite-button ${favorited ? 'favorited' : ''} ${className}`}
      aria-label={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      {favorited ? '★' : '☆'}
    </button>
  );
}
```

---

## Best Practices

### Backend Best Practices

#### 1. Controller Organization
```ruby
class Api::BaseController < ApplicationController
  before_action :set_session
  
  protected
  
  def set_session
    @session = Session.find_by_raw_session_id(current_session_id)
  end
  
  def pagination_params
    {
      limit: [params[:limit]&.to_i || 50, 100].min,
      offset: params[:offset]&.to_i || 0
    }
  end
end

class Api::RoomsController < Api::BaseController
  # Inherit common functionality
end
```

#### 2. Service Objects
```ruby
# backend/app/services/room_creation_service.rb
class RoomCreationService
  def initialize(session, room_params)
    @session = session
    @room_params = room_params
  end

  def call
    Room.transaction do
      room = Room.create!(@room_params.merge(creator_session_id: @session.id))
      
      # Additional setup logic
      create_initial_message(room)
      notify_creation(room)
      
      room
    end
  rescue ActiveRecord::RecordInvalid => e
    { error: e.record.errors }
  end

  private

  def create_initial_message(room)
    room.messages.create!(
      text_body: "Welcome to #{room.name}!",
      session: @session
    )
  end

  def notify_creation(room)
    # Broadcast room creation if needed
  end
end
```

#### 3. Model Concerns
```ruby
# backend/app/models/concerns/tokenizable.rb
module Tokenizable
  extend ActiveSupport::Concern

  included do
    validates :share_token, uniqueness: true, allow_blank: true
    before_create :generate_share_token
  end

  private

  def generate_share_token
    loop do
      token = SecureRandom.alphanumeric(6).downcase
      break self.share_token = token unless self.class.exists?(share_token: token)
    end
  end
end

# Usage in models
class Room < ApplicationRecord
  include Tokenizable
  # ... rest of model
end
```

### Frontend Best Practices

#### 1. Custom Hooks Pattern
```typescript
// frontend/src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/api';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      if (response.data) {
        setData(response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Unknown error');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, execute, reset };
}
```

#### 2. Error Boundary
```tsx
// frontend/src/components/ErrorBoundary.tsx
'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 3. Type-Safe API Responses
```typescript
// frontend/src/types/api.ts
export interface SessionData {
  id: number;
  session_id: string;
  display_name: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export interface RoomData {
  id: number;
  name: string;
  share_token: string;
  creator_session_id: string;
  message_count: number;
  participant_count: number;
  last_activity: string | null;
  created_at: string;
}

export interface MessageData {
  id: number;
  room_id: number;
  text_body: string;
  session: {
    display_name: string;
    nickname: string;
  };
  is_own: boolean;
  created_at: string;
}

// Use in API client
class ApiClient {
  async getSession(): Promise<ApiResponse<{ session: SessionData }>> {
    return this.request('/sessions/current');
  }
  
  async getRooms(): Promise<ApiResponse<{ rooms: RoomData[] }>> {
    return this.request('/rooms');
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db

# Reset database
docker-compose exec backend rails db:drop db:create db:migrate db:seed

# Check database connection
docker-compose exec backend rails dbconsole
```

#### 2. Session Issues
```bash
# Clear browser cookies
# Or use incognito mode

# Check session in Rails console
docker-compose exec backend rails console
Session.all

# Reset sessions
docker-compose exec backend rails runner "Session.destroy_all"
```

#### 3. Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf frontend/.next

# Reinstall dependencies
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install

# Check for TypeScript errors
docker-compose exec frontend npm run build
```

#### 4. API Connection Issues
```bash
# Check if backend is running
curl http://localhost:3001/api/sessions/current

# Check frontend proxy configuration
# frontend/next.config.ts should have proper proxy setup

# Verify CORS configuration in Rails
```

### Performance Issues

#### 1. Database Query Optimization
```ruby
# Use includes to avoid N+1 queries
@rooms = Room.includes(:messages, :creator_session)

# Use select to limit columns
@rooms = Room.select(:id, :name, :share_token, :created_at)

# Use counter cache for expensive counts
class Room < ApplicationRecord
  has_many :messages, dependent: :destroy, counter_cache: true
end
```

#### 2. Frontend Performance
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
});

// Use useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => b.created_at.localeCompare(a.created_at));
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback((id: string) => {
  // Handle click
}, []);
```

### Debugging Tools

#### Backend Debugging
```ruby
# Add to controller for debugging
Rails.logger.info "Session: #{@session.inspect}"
Rails.logger.info "Params: #{params.inspect}"

# Use rails console
docker-compose exec backend rails console
> Room.last
> Session.find_by_raw_session_id("session_id")

# Use debugger
require 'debug'
debugger  # Add this line to pause execution
```

#### Frontend Debugging
```typescript
// Use browser dev tools
console.log('API Response:', data);
console.table(rooms);

// Use React Developer Tools extension
// Add display names for better debugging
useSession.displayName = 'useSession';

// Network debugging
// Check Network tab in browser dev tools
// Verify request/response data
```

---

## Additional Resources

### Documentation Links
- [Rails API Documentation](https://api.rubyonrails.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Useful Commands Reference
```bash
# Docker commands
docker-compose up -d                    # Start services
docker-compose down                     # Stop services
docker-compose logs -f [service]        # View logs
docker-compose exec [service] [command] # Execute command

# Rails commands
rails console                           # Interactive console
rails dbconsole                        # Database console
rails generate model [name]            # Generate model
rails generate migration [name]        # Generate migration
rails db:migrate                       # Run migrations
rails db:rollback                      # Rollback migration
rails db:seed                          # Run seed data

# Frontend commands
npm install                             # Install dependencies
npm run dev                            # Start development server
npm run build                          # Build for production
npm test                               # Run tests
npm run lint                           # Run linter
```