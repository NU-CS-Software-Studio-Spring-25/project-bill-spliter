require 'faker'

# Clear all existing data first
puts "🧹 Clearing existing data..."
Settlement.destroy_all
ExpenseSplit.destroy_all
Expense.destroy_all
GroupMember.destroy_all
Group.destroy_all
User.destroy_all

puts "🌱 Seeding data..."

# Create a test user for authentication testing
puts "🧪 Creating test user..."
test_user = User.create!(
  name: "Test User",
  email: "testuser@example.com",
  password: "password123",
  password_confirmation: "password123"
)
puts "Created test user: #{test_user.email} / password123"

# Create additional 39 users with realistic names
users = [test_user]
39.times do
  user = User.create!(
    name: Faker::Name.name,
    email: Faker::Internet.unique.email,
    password: "password123",
    password_confirmation: "password123"
  )
  users << user
  puts "Created user: #{user.name} (#{user.email})"
end
puts "✅ Created #{users.length} users"

# Create 40 groups with realistic names
puts "🌱 Creating groups..."
groups = []
group_types = [
  "Trip to #{Faker::Address.city}",
  "#{Faker::Company.name} Team",
  "#{Faker::Hobby.activity} Club",
  "#{Faker::Food.dish} Dinner Group",
  "#{Faker::Music.genre} Night",
  "#{Faker::Sports::Football.team} Fans",
  "#{Faker::Movies::StarWars.planet} Roommates",
  "#{Faker::Games::Pokemon.name} Trainers",
  "#{Faker::Restaurant.name} Regulars",
  "#{Faker::University.name} Alumni"
]
40.times do |i|
  group = Group.create!(
    group_name: group_types.sample,
    creator: users.sample
  )
  groups << group
  puts "Created group: #{group.group_name}"
end
puts "✅ Created #{groups.length} groups"

# Create group memberships (2-5 members per group)
puts "🌱 Creating group memberships..."
groups.each do |group|
  # Add creator as admin
  GroupMember.create!(
    group: group,
    user: group.creator,
    role: "admin"
  )
  # Add 2-5 random members
  rand(2..5).times do
    member = users.sample
    next if member == group.creator || group.members.include?(member)
    GroupMember.create!(
      group: group,
      user: member,
      role: ["admin", "member"].sample
    )
  end
end
puts "✅ Created group memberships"

# Create expenses and splits
puts "🌱 Creating expenses and splits..."
expense_types = [
  "Dinner at #{Faker::Restaurant.name}",
  "Tickets for #{Faker::Music.band} concert",
  "Hotel stay in #{Faker::Address.city}",
  "Rental car for #{Faker::Date.forward(days: 7)}",
  "Groceries from #{Faker::Company.name}",
  "Movie tickets for #{Faker::Movie.title}",
  "Flight to #{Faker::Address.city}",
  "Shopping at #{Faker::Company.name}",
  "Uber ride to #{Faker::Address.city}",
  "Coffee at #{Faker::Coffee.blend_name}",
  "Lunch at #{Faker::Restaurant.name}",
  "Tickets for #{Faker::Sports::Football.team} game",
  "Gym membership at #{Faker::Company.name}",
  "Books from #{Faker::Book.title}",
  "Gift for #{Faker::Name.name}"
]

40.times do
  group = groups.sample
  expense = Expense.create!(
    group: group,
    payer: group.members.sample,
    description: expense_types.sample,
    total_amount: Faker::Commerce.price(range: 10.0..1000.0),
    expense_date: Faker::Date.between(from: 30.days.ago, to: Date.today)
  )

  # Split expense among random group members
  split_members = group.members.sample(rand(2..5))
  split_amount = (expense.total_amount / split_members.size).round(2)
  split_members.each do |member|
    # Skip if split already exists (avoids unique constraint violation)
    next if ExpenseSplit.exists?(expense: expense, user: member)
    ExpenseSplit.create!(
      expense: expense,
      user: member,
      amount: split_amount
    )
  end
end
puts "✅ Created #{Expense.count} expenses with splits"

# Create settlements
puts "🌱 Creating settlements..."
40.times do
  group = groups.sample
  payer = group.members.sample
  payee = group.members.sample
  next if payee == payer
  Settlement.create!(
    group: group,
    payer: payer,
    payee: payee,
    amount: Faker::Commerce.price(range: 5.0..500.0),
    settlement_date: Faker::Date.between(from: 30.days.ago, to: Date.today)
  )
end
puts "✅ Created #{Settlement.count} settlements"

puts "🌱 Seeding completed! You can log in with testuser@example.com / password123"
