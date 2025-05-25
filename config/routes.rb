Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
 # API Routes
 namespace :api do
  namespace :v1 do
    # Authentication routes
    post 'login', to: 'sessions#create'
    delete 'logout', to: 'sessions#destroy'
    get 'profile', to: 'sessions#show'
    post 'register', to: 'registrations#create'

    # Expenses API
    resources :expenses, only: [:index, :create, :destroy, :show] do
      collection do
        get :summary    # GET /api/v1/expenses/summary?group_id=X
      end
    end
    
    # Groups API
    resources :groups, only: [:index, :show, :create, :destroy] do
      member do
        get :balances     # GET /api/v1/groups/:id/balances - Get group balances and debts
        get :expenses     # GET /api/v1/groups/:id/expenses - Get all expenses for a group
        get :settlements  # GET /api/v1/groups/:id/settlements - Get all settlements for a group
      end
      
      collection do
        get :my_groups    # GET /api/v1/groups/my_groups?user_id=X - Get groups for a user
      end
    end
    
    # Users API
    resources :users, only: [:index, :show, :create, :destroy] do
      member do
        get :groups       # GET /api/v1/users/:id/groups - Get groups for a user
        get :balance      # GET /api/v1/users/:id/balance - Get total balance across all groups
      end
    end
    
    # Settlements API
    resources :settlements, only: [:index, :show, :create, :destroy] do
      collection do
        get :by_group     # GET /api/v1/settlements/by_group?group_id=X
      end
    end
    
    # Group Members API (for adding/removing members)
    resources :group_members, only: [:create, :destroy] do
      collection do
        post :bulk_create # POST /api/v1/group_members/bulk_create - Add multiple members
      end
    end
    
    # Expense Splits API (for custom splitting if needed later)
    resources :expense_splits, only: [:index, :show, :update] do
      member do
        patch :mark_settled   # PATCH /api/v1/expense_splits/:id/mark_settled
        patch :mark_unsettled # PATCH /api/v1/expense_splits/:id/mark_unsettled
      end
    end
  end
end

# Web/HTML Routes (for your existing Rails views)
resources :expenses, only: [:index, :new, :create, :destroy, :show]
resources :groups, only: [:show] do
  member do
    get :balances     # For web interface balance view
  end
end

  get '*path', to: 'static#index', constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

  root to: redirect('/index.html')
end
