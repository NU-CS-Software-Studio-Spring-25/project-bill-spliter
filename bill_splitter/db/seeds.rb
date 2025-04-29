# Clear all existing data first (optional but useful during development)
Expense.destroy_all
Group.destroy_all
User.destroy_all

# Create users (no group_ids yet)
alice = User.create!(name: "Alice", email: "alice@example.com", password: "password123", group_ids: [])
bob = User.create!(name: "Bob", email: "bob@example.com", password: "password123", group_ids: [])
carol = User.create!(name: "Carol", email: "carol@example.com", password: "password123", group_ids: [])
david = User.create!(name: "David", email: "david@example.com", password: "password123", group_ids: [])
emily = User.create!(name: "Emily", email: "emily@example.com", password: "password123", group_ids: [])
frank = User.create!(name: "Frank", email: "frank@example.com", password: "password123", group_ids: [])
puts "✅ Created users: Alice, Bob, Carol, David, Emily, Frank"

# Create groups
trip = Group.create!(group_name: "Trip to Chicago", created_by: alice.id, member_ids: [alice.id, frank.id])
lunch = Group.create!(group_name: "Group Lunch", created_by: bob.id, member_ids: [alice.id, bob.id, carol.id, david.id])
roommates = Group.create!(group_name: "Roommates", created_by: carol.id, member_ids: [alice.id, emily.id, carol.id])

puts "✅ Created groups: Trip to Chicago, Group Lunch, Roommates"

# Now update users' group_ids
Group.find_each do |group|
    group.member_ids.each do |user_id|
        user = User.find(user_id)
        user.group_ids << group.id unless user.group_ids.include?(group.id)
        user.save!
    end
end

# expense for trip group
Expense.create!(
  group_id: trip.id,
  added_by: alice.id,
  description: "Hotel Booking",
  total_amount: 600.00
)

Expense.create!(
  group_id: trip.id,
  added_by: alice.id,
  description: "Flight Tickets",
  total_amount: 1200.00
)

Expense.create!(
  group_id: trip.id,
  added_by: alice.id,
  description: "Ventra Tickets",
  total_amount: 10.00
)

Expense.create!(
  group_id: trip.id,
  added_by: frank.id,
  description: "Fancy Dinner",
  total_amount: 120.00
)

Expense.create!(
  group_id: trip.id,
  added_by: frank.id,
  description: "Drink at the Bar",
  total_amount: 50.00
)

# Expenses for Lunch group
Expense.create!(
  group_id: lunch.id,
  added_by: david.id,
  description: "Pizza Lunch",
  total_amount: 45.50
)

Expense.create!(
  group_id: lunch.id,
  added_by: alice.id,
  description: "Dessert",
  total_amount: 20.00
)

Expense.create!(
  group_id: lunch.id,
  added_by: alice.id,
  description: "Coffee",
  total_amount: 15.00
)

# Expenses for Roommate Group

Expense.create!(
  group_id: roommates.id,
  added_by: alice.id,
  description: "Sofa",
  total_amount: 150.00
)

Expense.create!(
  group_id: roommates.id,
  added_by: emily.id,
  description: "Group dinner",
  total_amount: 55.00
)

Expense.create!(
  group_id: roommates.id,
  added_by: carol.id,
  description: "New Coffee Machine",
  total_amount: 75.00
)

puts "✅ Expenses created"