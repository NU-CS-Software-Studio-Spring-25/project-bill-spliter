# db/seeds.rb
# Clear all existing data first (optional but useful during development)
Expense.destroy_all
GroupMembership.destroy_all
Group.destroy_all
User.destroy_all

# Create users
alice = User.create!(name: "Alice", email: "alice@example.com", password: "password123")
bob = User.create!(name: "Bob", email: "bob@example.com", password: "password123")
carol = User.create!(name: "Carol", email: "carol@example.com", password: "password123")
david = User.create!(name: "David", email: "david@example.com", password: "password123")
emily = User.create!(name: "Emily", email: "emily@example.com", password: "password123")
frank = User.create!(name: "Frank", email: "frank@example.com", password: "password123")
puts "✅ Created users: Alice, Bob, Carol, David, Emily, Frank"

# Create groups
trip = Group.create!(group_name: "Trip to Chicago", creator: alice)
lunch = Group.create!(group_name: "Group Lunch", creator: bob)
roommates = Group.create!(group_name: "Roommates", creator: carol)

puts "✅ Created groups: Trip to Chicago, Group Lunch, Roommates"

# Create group memberships
# Trip to Chicago members
GroupMembership.create!(group: trip, user: alice, role: "admin")
GroupMembership.create!(group: trip, user: frank, role: "member")

# Group Lunch members
GroupMembership.create!(group: lunch, user: bob, role: "admin")
GroupMembership.create!(group: lunch, user: alice, role: "member")
GroupMembership.create!(group: lunch, user: carol, role: "member")
GroupMembership.create!(group: lunch, user: david, role: "member")

# Roommates members
GroupMembership.create!(group: roommates, user: carol, role: "admin")
GroupMembership.create!(group: roommates, user: alice, role: "member")
GroupMembership.create!(group: roommates, user: emily, role: "member")

puts "✅ Created group memberships"

# expense for trip group
Expense.create!(
  group: trip,
  added_by_user: alice,
  description: "Hotel Booking",
  total_amount: 600.00
)

Expense.create!(
  group: trip,
  added_by_user: alice,
  description: "Flight Tickets",
  total_amount: 1200.00
)

Expense.create!(
  group: trip,
  added_by_user: alice,
  description: "Ventra Tickets",
  total_amount: 10.00
)

Expense.create!(
  group: trip,
  added_by_user: frank,
  description: "Fancy Dinner",
  total_amount: 120.00
)

Expense.create!(
  group: trip,
  added_by_user: frank,
  description: "Drink at the Bar",
  total_amount: 50.00
)

# Expenses for Lunch group
Expense.create!(
  group: lunch,
  added_by_user: david,
  description: "Pizza Lunch",
  total_amount: 45.50
)

Expense.create!(
  group: lunch,
  added_by_user: alice,
  description: "Dessert",
  total_amount: 20.00
)

Expense.create!(
  group: lunch,
  added_by_user: alice,
  description: "Coffee",
  total_amount: 15.00
)

# Expenses for Roommate Group
Expense.create!(
  group: roommates,
  added_by_user: alice,
  description: "Sofa",
  total_amount: 150.00
)

Expense.create!(
  group: roommates,
  added_by_user: emily,
  description: "Group dinner",
  total_amount: 55.00
)

Expense.create!(
  group: roommates,
  added_by_user: carol,
  description: "New Coffee Machine",
  total_amount: 75.00
)

puts "✅ Expenses created"