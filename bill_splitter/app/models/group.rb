class Group < ApplicationRecord
    belongs_to :creator, class_name: "User", foreign_key: :created_by
  
    has_many :group_members
    has_many :users, through: :group_members
    has_many :expenses
  end
  