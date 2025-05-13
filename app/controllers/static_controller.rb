class StaticController < ApplicationController
    def index
      render file: Rails.root.join("client", "build", "index.html")
    end
end