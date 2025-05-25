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

# Create 40 users with realistic names
users = []
40.times do |i|
  user = User.create!(
    name: Faker::Name.name,
    email: Faker::Internet.unique.email,
    password: "password123"
  )
  users << user
  puts "Created user: #{user.name} (#{user.email})"
end
puts "✅ Created #{users.length} users"

# Create 40 groups with realistic names
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
groups.each do |group|
  # Add creator as admin
  GroupMember.create!(
    group: group,
    user: group.creator,
    role: "admin"
  )
  
  # Add 2-5 random members
  rand(2..5).times do
    random_user = users.sample
    next if random_user == group.creator || group.members.include?(random_user) # Skip if it's the creator or already a member
    
    GroupMember.create!(
      group: group,
      user: random_user,
      role: ["admin", "member"].sample
    )
  end
end
puts "✅ Created group memberships"

# Create 40 expenses with realistic descriptions
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

  # Create expense splits for each expense
  # Split among 2-5 random members of the group
  expense.group.members.sample(rand(2..5)).each do |member|
    next if ExpenseSplit.exists?(expense: expense, user: member) # Skip if the split already exists
    
    ExpenseSplit.create!(
      expense: expense,
      user: member,
      amount: expense.total_amount / expense.group.members.count
    )
  end
end
puts "✅ Created #{Expense.count} expenses with splits"

# Create 40 settlements with realistic amounts
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
    settlement_date: Faker::Date.between(from: 30.days.ago, to: Date.today)
  )
end
puts "✅ Created #{Settlement.count} settlements"

puts "🌱 Seeding completed!" 