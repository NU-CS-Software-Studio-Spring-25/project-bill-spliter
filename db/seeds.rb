# Clear all existing data
Expense.destroy_all
#GroupMember.destroy_all
Group.destroy_all
User.destroy_all

# Create users
alice = User.create!(name: "Alice", email: "alice@example.com", password: "password123")
40.times do
    User.create!(
      name: Faker::Name.name,
      email: Faker::Internet.unique.email,
      password: "password"
    )
end
users = User.all
puts "✅ Created users: Alice and 40 other users"
group_names=[]
100.times do
    group_names << [
        "#{Faker::Address.city} Trip",
        "#{Faker::Team.creature.capitalize} Team",
        "#{Faker::Music.genre} Night",
        "#{Faker::Food.dish} Dinner",
        "#{Faker::Hobby.activity} Club",
        "#{Faker::Company.buzzword.capitalize} Project",
        "#{Faker::Nation.nationality} Roommates",
    ].sample
end
40.times do
    group = Group.create!(
      group_name: group_names.sample,
      creator: users.sample
    )
    group.members << alice
    group.members << users.sample(rand(2..5))
end

puts "✅ Created 40 groups"

Group.all.each do |group|
    rand(3..7).times do
      Expense.create!(
        group: group,
        description: Faker::Commerce.product_name,
        total_amount: Faker::Commerce.price(range: 5.0..100.0),
        added_by: group.members.sample.id
      )
    end
  end
  
  puts "✅ Done seeding!"