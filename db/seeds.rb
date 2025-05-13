# Clear all existing data
Expense.destroy_all
#GroupMember.destroy_all
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

# Create groups (with creator)
trip = Group.create!(group_name: "Trip to Chicago", created_by: alice.id)
lunch = Group.create!(group_name: "Group Lunch", created_by: bob.id)
roommates = Group.create!(group_name: "Roommates", created_by: carol.id)

puts "✅ Created groups: Trip to Chicago, Group Lunch, Roommates"

# Add members via has_many :through
trip.members << [alice, frank]
lunch.members << [alice, bob, carol, david]
roommates.members << [alice, emily, carol]

# Create expenses for trip group
Expense.create!(group: trip, added_by: alice.id, description: "Hotel Booking", total_amount: 600.00)
Expense.create!(group: trip, added_by: alice.id, description: "Flight Tickets", total_amount: 1200.00)
Expense.create!(group: trip, added_by: alice.id, description: "Ventra Tickets", total_amount: 10.00)
Expense.create!(group: trip, added_by: frank.id, description: "Fancy Dinner", total_amount: 120.00)
Expense.create!(group: trip, added_by: frank.id, description: "Drink at the Bar", total_amount: 50.00)

# Expenses for lunch group
Expense.create!(group: lunch, added_by: david.id, description: "Pizza Lunch", total_amount: 45.50)
Expense.create!(group: lunch, added_by: alice.id, description: "Dessert", total_amount: 20.00)
Expense.create!(group: lunch, added_by: alice.id, description: "Coffee", total_amount: 15.00)

# Expenses for roommate group
Expense.create!(group: roommates, added_by: alice.id, description: "Sofa", total_amount: 150.00)
Expense.create!(group: roommates, added_by: emily.id, description: "Group dinner", total_amount: 55.00)
Expense.create!(group: roommates, added_by: carol.id, description: "New Coffee Machine", total_amount: 75.00)

puts "✅ Expenses created"
