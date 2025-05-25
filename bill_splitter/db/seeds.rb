require 'faker'

# Clear all existing data first
puts "🧹 Clearing existing data..."
Settlement.destroy_all
ExpenseSplit.destroy_all
Expense.destroy_all
GroupMembership.destroy_all
Group.destroy_all
User.destroy_all

puts "🌱 Seeding data..."

# Create 40 users with Faker data
users = []
40.times do |i|
  user = User.create!(
    name: "User #{i + 1}",
    email: "user#{i + 1}@example.com",
    password: "password123"
  )
  users << user
  puts "Created user: #{user.name} (#{user.email})"
end
puts "✅ Created #{users.length} users"

# Create 40 groups with Faker data
groups = []
40.times do |i|
  group = Group.create!(
    group_name: "Group #{i + 1}",
    creator: users.sample
  )
  groups << group
  puts "Created group: #{group.group_name}"
end
puts "✅ Created #{groups.length} groups"

# Create group memberships (2-5 members per group)
groups.each do |group|
  # Add creator as admin
  GroupMembership.create!(
    group: group,
    user: group.creator,
    role: "admin"
  )
  
  # Add 2-5 random members
  rand(2..5).times do
    random_user = users.sample
    next if random_user == group.creator # Skip if it's the creator
    
    GroupMembership.create!(
      group: group,
      user: random_user,
      role: ["admin", "member"].sample
    )
  end
end
puts "✅ Created group memberships"

# Create 40 expenses with Faker data
40.times do
  group = groups.sample
  expense = Expense.create!(
    group: group,
    payer: group.members.sample,
    description: Faker::Commerce.product_name,
    total_amount: Faker::Commerce.price(range: 10.0..1000.0),
    expense_date: Faker::Date.between(from: 30.days.ago, to: Date.today)
  )

  # Create expense splits for each expense
  # Split among 2-5 random members of the group
  expense.group.members.sample(rand(2..5)).each do |member|
    ExpenseSplit.create!(
      expense: expense,
      user: member,
      amount: expense.total_amount / expense.group.members.count,
      paid: [true, false].sample
    )
  end
end
puts "✅ Created #{Expense.count} expenses with splits"

# Create 40 settlements with Faker data
40.times do
  group = groups.sample
  payer = group.members.sample
  payee = group.members.sample
  
  # Ensure payer and payee are different
  while payee == payer
    payee = group.members.sample
  end

  Settlement.create!(
    group: group,
    payer: payer,
    payee: payee,
    amount: Faker::Commerce.price(range: 5.0..500.0),
    status: ["pending", "completed", "cancelled"].sample,
    completed_at: Faker::Date.between(from: 30.days.ago, to: Date.today)
  )
end
puts "✅ Created #{Settlement.count} settlements"

puts "🌱 Seeding completed!" 