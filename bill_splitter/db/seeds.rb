
# db/seeds.rb
require 'faker'

# Clear all existing data first
Expense.destroy_all
GroupMembership.destroy_all
Group.destroy_all
User.destroy_all

puts "Seeding data..."

# Create 40 users with Faker data
users = []
40.times do
  user = User.create!(
    name: Faker::Name.name,
    email: Faker::Internet.unique.email,
    password: "password123"
  )
  users << user
end
puts "Created #{users.length} users"

# Create 40 groups with Faker data
groups = []
40.times do
  group = Group.create!(
    group_name: Faker::Company.unique.name,
    creator: users.sample
  )
  groups << group
end
puts "Created #{groups.length} groups"

# Create group memberships (at least 2 members per group)
groups.each do |group|
  # Ensure creator is added as admin only once
  unless GroupMembership.exists?(group: group, user: group.creator)
    GroupMembership.create!(
      group: group,
      user: group.creator,
      role: "admin"
    )
  end

  # Add other members (2-5) ensuring no duplicates
  (users - [group.creator]).sample(rand(2..5)).each do |user|
    unless GroupMembership.exists?(group: group, user: user)
      GroupMembership.create!(
        group: group,
        user: user,
        role: "member" # Only creator should be admin
      )
    end
  end
end
puts "Created group memberships"

# Create 40 expenses with Faker data
40.times do
  group = groups.sample
  Expense.create!(
    group: group,
    added_by_user: group.members.sample,
    description: Faker::Commerce.product_name,
    total_amount: Faker::Commerce.price(range: 10.0..1000.0)
  )
end
puts "Created #{Expense.count} expenses"

# Create expense splits for each expense
Expense.find_each do |expense|
  # Create splits for 2-5 random members of the group
  expense.group.members.sample(rand(2..5)).each do |member|
    ExpenseSplit.create!(
      expense: expense,
      user: member,
      amount: expense.total_amount / expense.group.members.count,
      paid: [true, false].sample
    )
  end
end
puts "Created expense splits"

puts "Seeding completed!"
