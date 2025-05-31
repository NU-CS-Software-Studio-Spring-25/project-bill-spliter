Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'https://bill-splitter-api-d46b8052a10f.herokuapp.com' # Add your frontend URLs
    resource '*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options, :head],
             credentials: true # Enable credentials for cookies/sessions
  end
end
