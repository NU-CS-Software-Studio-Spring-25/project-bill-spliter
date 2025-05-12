# app/models/group.rb
class Group < ApplicationRecord
  belongs_to :creator, class_name: "User", foreign_key: :created_by
  
  has_many :group_memberships, dependent: :destroy
  has_many :members, through: :group_memberships, source: :user
  has_many :expenses, dependent: :destroy

  # Add a member
  def add_member(user, role: "member")
    group_memberships.create(user: user, role: role)
  end

  # Remove a member
  def remove_member(user)
    group_memberships.find_by(user: user)&.destroy
  end

  # Get all admins of the group
  def admins
    members.joins(:group_memberships).where(group_memberships: { role: "admin" })
  end
end