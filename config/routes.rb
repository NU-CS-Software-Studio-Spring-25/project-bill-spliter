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
  namespace :api do
    namespace :v1 do
      resources :expenses, only: [:index,:create,:destroy, :show]
      resources :groups, only: [:index, :show, :create, :destroy]
      resources :users, only: [:index, :show, :create, :destroy]
      get 'users/groups/:user_id', to: 'users#groups'
    end
  end
  resources :expenses, only: [:index, :new, :create, :destroy, :show]
  resources :groups, only: [:show]

  get '*path', to: 'static#index', constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

  root to: redirect('/index.html')
end
