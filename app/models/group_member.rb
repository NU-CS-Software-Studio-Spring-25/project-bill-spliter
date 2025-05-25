# app/models/group_member.rb
class GroupMember < ApplicationRecord
  belongs_to :group
  belongs_to :user
  
  # Prevent duplicate memberships
  validates :user_id, uniqueness: { scope: :group_id }
end