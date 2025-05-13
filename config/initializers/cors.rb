Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins '*' # Or your Next.js frontend's domain in production
      resource '*',
               headers: :any,
               methods: [:get, :post, :put, :patch, :delete, :options, :head]
    end
  end