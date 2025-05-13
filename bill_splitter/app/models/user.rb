# app/models/user.rb
class User < ApplicationRecord
  has_secure_password
  
  has_many :group_memberships, dependent: :destroy
  has_many :groups, through: :group_memberships
  has_many :expenses, foreign_key: :added_by
  has_many :expense_splits

  # Optional: Add method to check if user is in a specific group
  def member_of?(group)
    groups.include?(group)
  end

  # Optional: Get user's role in a group
  def role_in(group)
    group_memberships.find_by(group: group)&.role
  end
end
