class Group < ApplicationRecord
  belongs_to :creator, class_name: "User", foreign_key: :created_by

  has_many :group_members, dependent: :destroy
  has_many :members, through: :group_members, source: :user

  has_many :expenses, dependent: :destroy
end