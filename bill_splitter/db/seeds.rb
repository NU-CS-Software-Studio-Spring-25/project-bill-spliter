# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end


# db/seeds.rb
alice = User.create!(name: "Alice", email: "alice@example.com", password: "password123")

group = Group.create!(group_name: "Trip to NYC", created_by: alice.id)


# user1 = User.create!(name: "Alice", email: "alice@example.com", password: "password")
# user2 = User.create!(name: "Bob", email: "bob@example.com", password: "password")

# group = Group.create!(group_name: "Trip to NYC", created_by: user1.id)
# GroupMember.create!(group: group, user: user1)
# GroupMember.create!(group: group, user: user2)

# expense = Expense.create!(group: group, added_by: user1.id, description: "Dinner", total_amount: 100)
# ExpenseSplit.create!(expense: expense, user: user1, amount: 50, paid: true)
# ExpenseSplit.create!(expense: expense, user: user2, amount: 50, paid: false)
